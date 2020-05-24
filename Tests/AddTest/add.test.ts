// Tests/AddTest/add.test.ts
import { TestSuite } from '../../src';
import { strictEqual } from 'assert';
import { add } from './add';

export class AddTest extends TestSuite {
  public testName = 'addTest';

  public async test(): Promise<void> {
    strictEqual(add(1, 1), 2, 'add(1, 1) === 2');

    strictEqual(add(1, 2), 3, 'add(1, 2) === 3');

    strictEqual(add(5, 5), 10, 'add(5, 5) === 10');
  }
}
