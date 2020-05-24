// src/cli.ts
// #!/usr/bin/env node
import { WorkerController } from './Modules/Worker/WorkerController';
import { resolve as resolvePath } from 'path';
import colors from 'colors';
import { AssertionError } from 'assert';

const testsPath = resolvePath(`__tests__`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAssertionError(object: any): object is AssertionError {
  if ('actual' in object) {
    return true;
  }

  return false;
}

async function runCLI(): Promise<void> {
  const workerController = new WorkerController();

  await workerController.findTestFiles(testsPath);

  await workerController.spawnWorkers(4);

  await workerController.startTesting();

  for (const testFile of workerController.testFiles) {
    console.log(
      `${colors.bgYellow(colors.black(`> Test File`))} ${testFile.path}`,
    );

    testFile.tests.map((test) => {
      if (typeof test.success === 'undefined') {
        throw new Error('Fucker');
      }

      switch (test.success) {
        case true:
          console.log(`\t${colors.bgGreen(`Success`)} ${test.name}`);
          break;
        case false:
          console.log(`\t${colors.bgRed(`Test Suite - ${test.name}`)}`);

          if (isAssertionError(test.error)) {
            console.log(
              `\t\tExpected ${colors.green(
                test.error.expected,
              )} but got ${colors.bgRed(test.error.actual)}`,
            );
          }

          break;
      }
    });
  }
}

try {
  runCLI().then(() => console.log('Tests finished'));
} catch {
  console.error('Error while running tests');
}
