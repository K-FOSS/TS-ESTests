// src/Modules/Tests/TestRunnerWorker.ts
import { parentPort } from 'worker_threads';
import { WorkerMessage, WorkerMessageType } from './WorkerMessages';
import { TestSuite } from '../TestSuite';
import { strictEqual } from 'assert';
import { timeout } from '../../Utils/timeout';

if (!parentPort) throw new Error('Invalid worker. no Parent Thread port');

/**
 * Sends a message from this worker to the parent thread
 * @param message Worker Message to send to parent
 */
function sendParentMessage(message: WorkerMessage): void {
  if (!parentPort) throw new Error('Invalid worker. no Parent Thread port');

  return parentPort.postMessage(message);
}

/**
 * Sends the ready message to parent thread to indicate we can accept another test
 */
function sendReadyMessage(): void {
  return sendParentMessage({
    type: WorkerMessageType.READY,
  });
}

class ExampleTest extends TestSuite {
  public testName = 'ExampleTest';

  public async test(): Promise<void> {
    const exampleString = 'helloWorld';

    await timeout(100);

    strictEqual(exampleString, 'helloWorld');
  }
}

type TestSuiteImport = {
  [key: string]: typeof ExampleTest;
};

/**
 *
 */

parentPort.addListener(
  'message',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (filePath: string): Promise<void> => {
    console.log(filePath);

    const testSuite = (await import(filePath)) as TestSuiteImport;

    await Promise.all(
      Object.values(testSuite).map(async (TestSuiteClass) => {
        const testSuiteClass = new TestSuiteClass();

        sendParentMessage({
          type: WorkerMessageType.PUSH_TEST_SUITE,
          filePath,
          testSuiteName: testSuiteClass.testName,
        });

        let success: boolean;

        // eslint-disable-next-line @typescript-eslint/ban-types
        let error: object | undefined;
        try {
          await testSuiteClass.test();
          success = true;
        } catch (err) {
          success = false;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          error = JSON.parse(JSON.stringify(err));
        }

        sendParentMessage({
          type: WorkerMessageType.PUSH_TEST_SUITE_OUTPUT,
          filePath,
          testSuiteName: testSuiteClass.testName,
          success,
          error: error as Error,
        });
      }),
    );

    sendReadyMessage();
  },
);

// Now that all functions and event liseners are loaded. Tell parent thread that we can accept tasks now
sendReadyMessage();
