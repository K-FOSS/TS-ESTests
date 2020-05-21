// src/cli.ts
// #!/usr/bin/env node
import { TestController } from './Modules/Tests/TestController';

async function runCLI(): Promise<void> {
  const testController = new TestController();

  await testController.findTestFiles('./');
}

runCLI();
