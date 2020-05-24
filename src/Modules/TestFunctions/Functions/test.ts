// src/Modules/TestFunctions/test.ts
import { testFunctionController } from '../TestFunctionController';

export async function test(
  testName: string,
  testFn: () => Promise<any>,
): Promise<void> {
  console.log(`Test function has been called ${testName}`);

  testFunctionController.emit('testFn', testName);

  try {
    await testFn();
    testFunctionController.emit('testFnOutput', {
      testFile: 'any',
    });
  } catch (error) {
    testFunctionController.emit('testFnOutput', {
      error,
    });
  }
}
