#!/usr/bin/env sh
// src/cli.ts
':'; // ; exec "$(command -v node || command -v nodejs)" --loader @k-foss/ts-esnode --experimental-modules --experimental-specifier-resolution=node --experimental-import-meta-resolve "$0" "$@"

import { WorkerController } from './Modules/Worker/WorkerController';
import colors from 'colors';
import { isAssertionError } from './Utils/isAssertionError';

if (process.argv.length < 3) {
  throw new Error('Provide the path of the tests folder');
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const path = process.argv.pop()!;

async function runCLI(): Promise<void> {
  const workerController = new WorkerController();

  await workerController.findTestFiles(path);

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
  (err) => {
    console.error('Error while running tests', err);
  },
);
