import { Test } from '../Tests/TestModel';

// src/Modules/Tests/TestFileModel.ts
export class TestFile {
  public path: string;

  public tests: Test[] = [];

  constructor(options: Partial<TestFile>) {
    Object.assign(this, options);
  }
}
