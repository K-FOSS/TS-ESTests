// src/index.ts

async function sayHello(name = 'John'): Promise<void> {
  console.log(`Hello ${name}!`);
}

console.log(`Starting TS-ESTests`);

await sayHello('K-FOSS');

export { };
