// src/Modules/Worker/WorkerMessage.ts
export enum WorkerMessageType {
  READY,
  TEST_FINISHED,
  PUSH_TEST_SUITE_OUTPUT,
  PUSH_TEST_SUITE,
  TEST_RUNNING,
}

interface WorkerReadyMessage {
  type: WorkerMessageType.READY;
}

interface WorkerPushTestSuiteOutputMessage {
  type: WorkerMessageType.PUSH_TEST_SUITE_OUTPUT;

  filePath: string;

  testSuiteName: string;

  success: boolean;

  error?: Error;
}

interface WorkerPushTestSuiteMessage {
  type: WorkerMessageType.PUSH_TEST_SUITE;

  filePath: string;

  testSuiteName: string;
}

export type WorkerMessage =
  | WorkerReadyMessage
  | WorkerPushTestSuiteOutputMessage
  | WorkerPushTestSuiteMessage;
