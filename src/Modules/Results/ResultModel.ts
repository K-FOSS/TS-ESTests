// src/Modules/Results/ResultModel.ts
import { Writable } from 'stream';

export class Result {
  public output: string[] = [];

  public constructor(options: Partial<Result>) {
    Object.assign(this, options);
  }

  public createWriteStream(): Writable {
    const writeStream = new Writable({
      write: (data, _, done): void => {
        this.output.push(data);
        done();
      },
    });

    return writeStream;
  }
}
