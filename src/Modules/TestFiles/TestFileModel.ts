// src/Modules/Tests/TestFileModel.ts
import { Test } from '../Tests/TestModel';

export enum TestFileStatus {
  PENDING,
  RUNNING,
  DONE,
}

export class TestFile {
  public path: string;

  public status: TestFileStatus = TestFileStatus.PENDING;

  public tests: Test[] = [];

  public constructor(options: Partial<TestFile>) {
    Object.assign(this, options);
  }
}
