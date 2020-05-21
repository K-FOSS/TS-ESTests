// src/Modules/Results/ResultModel.ts
import { Writable } from 'stream';

export class Result {
  public output: string[] = [];

  constructor(options: Partial<Result>) {
    Object.assign(this, options);
  }

  createWriteStream(): Writable {
    const writeStream = new Writable({
      write: (data, _, done) => {
        this.output.push(data);
        done();
      },
    });

    return writeStream;
  }
}
