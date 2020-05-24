// src/Modules/TestSuite/TestSuite.ts
export abstract class TestSuite {
  abstract testName: string;

  public async runTest(): Promise<void> {
    try {
      console.log(`Running testSuite: ${this.testName}`);

      await this.test();
    } catch {}
  }

  abstract test(): Promise<void>;
}
