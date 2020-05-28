// Tests/ErorrTest/error.ts
import { randomError } from './randomError';

export async function throwError(): Promise<never> {
  throw randomError;
}
