// src/Utils/isAssertionErrot.ts

import { AssertionError } from 'assert';

// eslint-disable-next-line
export function isAssertionError(object: any): object is AssertionError {
  if ('actual' in object) {
    return true;
  }

  return false;
}
