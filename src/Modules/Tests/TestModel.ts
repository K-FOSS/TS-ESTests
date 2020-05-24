// src/Modules/Tests/TestModel.ts
export class Test {
  public name: string;

  public success: boolean | undefined;

  public error: Error | undefined;

  public constructor(options: Partial<Test>) {
    Object.assign(this, options);
  }
}
