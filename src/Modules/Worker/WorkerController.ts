// src/Modules/Worker/WorkerController.ts
import { promises as fs } from 'fs';
import { resolve as resolvePath } from 'path';
import { spawnWorker } from '@k-foss/ts-worker';
import { TestFile, TestFileStatus } from '../TestFiles/TestFileModel';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import { WorkerMessage, WorkerMessageType } from './WorkerMessages';
import { BaseEventEmitter } from '../../Utils/Events';
import { Test } from '../Tests/TestModel';

interface TestControllerOptions {
  /**
   * Regex used to test the
   */
  testFileRegex: RegExp;
}

interface WorkerThread {
  workerThread: Worker;

  ready: boolean;

  online: boolean;
}

const controllerDefaultOptions: TestControllerOptions = {
  testFileRegex: /.*(test|spec)\.ts/gm,
};

interface WorkerControllerEventMap {
  testFinished: string;

  done: boolean;
}

export class WorkerController extends BaseEventEmitter<
  WorkerControllerEventMap
> {
  public options: TestControllerOptions;

  /**
   * Array of test files found by the {@link WorkerController#findTestFiles}
   */
  public testFiles: TestFile[] = [];

  /**
   * Array of workers spawned by controller
   */
  public workers: WorkerThread[] = [];

  /**
   * Cache for testFiles to testFileIndex
   */
  public testFilePathMap = new Map<string, number>();

  /**
   * Has a single test already been processed
   * @todo Check if this is needed, this class is copied from my TS-ESWeb POC
   */
  public started = false;

  public constructor(
    options: TestControllerOptions = controllerDefaultOptions,
  ) {
    super();
    this.options = options;
  }

  public get pendingTestFiles(): TestFile[] {
    return this.testFiles.filter(
      ({ status }) => status === TestFileStatus.PENDING,
    );
  }

  public get threads(): number {
    return this.workers.length;
  }

  public get lazyWorkers(): WorkerThread[] {
    return this.workers.filter(
      ({ ready, online }) => ready === true && online === true,
    );
  }

  public get lazyThreads(): number {
    return this.lazyWorkers.length;
  }

  public findTestFile(filePath: string): TestFile | undefined {
    return this.testFiles.find(({ path }) => path === filePath);
  }

  /**
   * Recurssiberly searches a root path for test files and loads them into the controller
   * @param filePath Root file path to recursively search for testFiles
   */
  public async findTestFiles(rootDir: string): Promise<void> {
    const controllerOptions = this.options;

    async function processDirectory(
      directoryPath: string,
    ): Promise<TestFile[]> {
      const directoryContents = await fs.readdir(directoryPath, {
        withFileTypes: true,
        encoding: 'utf-8',
      });

      const testFiles = await Promise.all(
        directoryContents.map(async (dirContent) => {
          const contentName = dirContent.name;
          const contentPath = resolvePath(directoryPath, contentName);

          if (contentName === 'node_modules') return [];

          if (dirContent.isDirectory()) {
            return processDirectory(contentPath);
          }

          if (controllerOptions.testFileRegex.test(dirContent.name)) {
            return new TestFile({
              path: contentPath,
            });
          }

          return [];
        }),
      );

      return testFiles.filter(Boolean).flat();
    }

    const testFiles = await processDirectory(rootDir);
    this.testFiles.push(...testFiles);
  }

  /**
   * Spawns the provided number of worker threads to run tests
   * @param threadCount Number of worker threads to spawn
   */
  public async spawnWorkers(threadCount: number): Promise<void> {
    const workerModulePath = await import.meta.resolve(
      './Worker.ts',
      import.meta.url,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
    for (const workerThread of Array(threadCount).fill(0)) {
      const worker = spawnWorker(fileURLToPath(workerModulePath), {});

      this.workers.push({
        workerThread: worker,
        online: false,
        ready: false,
      });

      /**
       * When worker reports as online update the {@see WorkerController#workers} {@see WorkerThread#online} property to online.
       */
      worker.on('online', () => {
        const workerThread = this.workers.find(
          ({ workerThread }) => workerThread.threadId === worker.threadId,
        );

        if (!workerThread) {
          throw new Error('Invalid worker returned online message');
        }

        workerThread.online = true;
      });

      /**
       * When we recieve a message from the worker pass it to {@see WorkerController#handleWorkerMessage}
       */
      worker.on('message', this.handleWorkerMessage(worker));

      this.on('done', () => worker.terminate());
    }
  }

  /**
   * Create the function for processsing all incoming messages for a worker
   * @param worker Worker thread we will be recieveing messages from
   *
   * @example ```ts
   * worker.on('message', this.handleWorkerMessage(worker));
   * ```
   * @returns a function containing the handling logic for incoming messages
   *
   */
  public handleWorkerMessage(worker: Worker): (message: WorkerMessage) => void {
    const workerThread = this.workers.find(
      ({ workerThread }) => workerThread.threadId === worker.threadId,
    );
    if (!workerThread) throw new Error('Recieved message from invalid worker');

    return (message: WorkerMessage): void => {
      let testFile: TestFile | undefined;
      let test: Test | undefined;

      switch (message.type) {
        case WorkerMessageType.READY:
          workerThread.ready = true;
          break;
        case WorkerMessageType.PUSH_TEST_SUITE:
          testFile = this.findTestFile(message.filePath);
          if (!testFile) throw new Error('Worker sent invalid testFile');

          testFile.tests.push(
            new Test({
              name: message.testSuiteName,
            }),
          );

          this.started = true;
          break;
        case WorkerMessageType.PUSH_TEST_SUITE_OUTPUT:
          testFile = this.findTestFile(message.filePath);
          if (!testFile) throw new Error('Worker sent invalid testFile');

          test = testFile.tests.find(
            ({ name }) => name === message.testSuiteName,
          );
          if (!test) {
            throw new Error('Worker provided invalid testSuite name');
          }

          Object.assign(test, {
            success: message.success,
            error: message.error,
          });

          break;
      }
    };
  }

  /**
   * Starts a `setInterval` to check if there are tests waiting to be run, if workers are {@see WorkerThread#ready}
   */
  public startPolling(): void {
    console.log('Starting polling for tests and workers');

    // Start a `setInterval` that runs every 500 seconds and checks for tests and workers ready to run
    const poll = setInterval(() => {
      if (this.lazyThreads > 0 && this.pendingTestFiles.length > 0) {
        const lazyWorker = this.lazyWorkers.pop();

        if (!lazyWorker) {
          console.log('No worker?');
          return;
        }

        const testFile = this.pendingTestFiles.pop();
        if (!testFile) {
          console.log('Invalid test path?');
          return;
        }

        lazyWorker.workerThread.postMessage(testFile.path);
        testFile.status = TestFileStatus.RUNNING;

        lazyWorker.ready = false;
      }

      /**
       * If there are the same number of lazyThreads as the amount of threads that were spawned,
       * but there are no tasks left then we can make the assumption that we are done.
       */
      if (this.lazyThreads === this.threads && this.started === true) {
        this.emit('done', true);

        // Since we are done we can stop polling
        clearInterval(poll);
      }
    }, 500);
  }

  public startTesting(): Promise<void> {
    /**
     * Start polling for workers ready to recieve tests
     */
    this.startPolling();

    return new Promise((resolve, reject) => this.on('done', () => resolve()));
  }
}
