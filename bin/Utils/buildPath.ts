// bin/Utils/buildPath.ts
import { resolve as resolvePath } from 'path';
import ts from 'typescript';
import { reportDiagnostic, reportSolutionBuilderStatus } from './Logging/index';
import { tsSys } from './tsSystem';

/**
 * Builds a source path
 * @param srcStr Source Files Path
 * @param watch Start a watcher to compile on file change
 */
export async function buildPath(
  srcStr: string,
  watch = false,
): Promise<number | void> {
  const srcPath = resolvePath(srcStr);
  const tsConfigPath = resolvePath('tsconfig.build.json');

  console.log(srcPath);

  /**
   * TypeScript Program to use
   */
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  if (watch) {
    const host = ts.createWatchCompilerHost(
      tsConfigPath,
      {},
      tsSys,
      createProgram,
    );

    ts.createWatchProgram(host);
  } else {
    const host = ts.createSolutionBuilderHost(
      tsSys,
      undefined,
      reportDiagnostic,
      reportSolutionBuilderStatus,
    );

    console.log(tsConfigPath);
    const solution = ts.createSolutionBuilder(host, [tsConfigPath], {
      verbose: true,
      force: true,
    });

    console.log(solution.build());

    console.log(solution.buildReferences);
  }
}
