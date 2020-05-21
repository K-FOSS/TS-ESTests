// src/Modules/Tests/TestController.ts
import { promises as fs } from 'fs';
import { resolvePath } from '../../Utils/resolvePath';
import { TestFile } from '../TestFiles/TestFileModel';

interface TestControllerOptions {
  /**
   * Regex used to test the
   */
  testFileRegex: RegExp;
}

const controllerDefaultOptions: TestControllerOptions = {
  testFileRegex: /.*(test|spec)\.ts/gm,
};

export class TestController {
  public options: TestControllerOptions;

  constructor(options: TestControllerOptions = controllerDefaultOptions) {
    this.options = options;
  }

  async findTestFiles(rootDir: string): Promise<void> {
    const controllerOptions = this.options;

    async function processDirectory(directoryPath: string): Promise<void> {
      const directoryContents = await fs.readdir(directoryPath, {
        withFileTypes: true,
        encoding: 'utf-8',
      });

      const testFiles = await Promise.all(
        directoryContents.map(async (dirContent) => {
          const contentName = dirContent.name;
          const contentPath = resolvePath(directoryPath, contentName);

          if (contentName === 'node_modules') return [];

          if (dirContent.isDirectory()) {
            return processDirectory(contentPath);
          }

          if (controllerOptions.testFileRegex.test(dirContent.name)) {
            return new TestFile({
              path: contentPath,
            });
          }

          return [];
        }),
      );

      console.log(testFiles.flat(5));
    }

    await processDirectory(rootDir);
  }
}
