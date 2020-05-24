// src/Modules/TestFunctions/TestFunctionController.ts
import { BaseEventEmitter } from '../../Utils/Events';

interface TestFnErrorResult {
  error: Error;
}

interface TestFnSuccessResult {
  testFile: string;
}

interface TestFunctionControllerEventMap {
  testFn: string;

  testFnOutput: TestFnErrorResult | TestFnSuccessResult;
}

class TestFunctionController extends BaseEventEmitter<
  TestFunctionControllerEventMap
> {}

export const testFunctionController = new TestFunctionController();
