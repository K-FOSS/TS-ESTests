// src/Utils/resolvePath.test.ts
import { resolvePath } from '../src/Utils/resolvePath';
import { strictEqual } from 'assert';
import { TestSuite } from '../src';

export class ResolvePathTest extends TestSuite {
  public testName = 'resolvePathTest';

  public async test() {
    const path1 = await resolvePath('./resolvePath.ts', import.meta.url);

    strictEqual(path1, '/workspaces/TS-ESTests/__tests__/resolvePath.ts');
  }
}
