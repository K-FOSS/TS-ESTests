// src/Modules/TestSuite/TestSuite.ts
export abstract class TestSuite {
  abstract testName: string;

  abstract test(): Promise<void>;
}
