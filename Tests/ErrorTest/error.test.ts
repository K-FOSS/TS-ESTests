// Tests/AddTest/add.test.ts
import { TestSuite } from '../../src';
import { rejects } from 'assert';
import { randomError } from './randomError';

export class ErrorTest extends TestSuite {
  public testName = 'errorTest';

  public async test(): Promise<void> {
    const { throwError } = await import('./error');

    await rejects(throwError, randomError);
    // throws(() => throwError(), 'throwError() throws');
  }
}
