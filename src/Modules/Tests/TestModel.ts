// src/Modules/Tests/TestModel.ts
export class Test {
  public name: string;

  constructor(options: Partial<Test>) {
    Object.assign(this, options);
  }
}
