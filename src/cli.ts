// src/cli.ts
// #!/usr/bin/env node
import { WorkerController } from './Modules/Worker/WorkerController';
import colors from 'colors';
import { isAssertionError } from './Utils/isAssertionError';

async function runCLI(): Promise<void> {
  const workerController = new WorkerController();

  await workerController.findTestFiles('Tests');

  await workerController.spawnWorkers(4);

  await workerController.startTesting();

  for (const testFile of workerController.testFiles) {
    console.log(
      `${colors.bgYellow(colors.black(`> Test File`))} ${testFile.path}`,
    );

    testFile.tests.map((test) => {
      if (typeof test.success === 'undefined') {
        throw new Error('This error should never be thrown');
      }

      switch (test.success) {
        case true:
          console.log(`\t${colors.bgGreen(`Success`)} ${test.name}`);
          break;
        case false:
          console.log(`\t${colors.bgRed(`Test Suite - ${test.name}`)}`);

          if (isAssertionError(test.error)) {
            console.log(`\t\t${colors.bgRed(test.error.message)}`);
            console.log(
              `\t\t\tExpected ${colors.green(
                test.error.expected,
              )} but got ${colors.bgRed(test.error.actual)}`,
            );
          }

          break;
      }
    });
  }
}

runCLI().then(
  () => {
    console.log('Tests done');
  },
  () => {
    console.error('Error while running tests');
  },
);
