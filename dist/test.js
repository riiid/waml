import { readdirSync } from "fs";
import { resolve } from "path";

const root = resolve();

for(const v of readdirSync(resolve(root, "tests"))){
  console.log(`Running ${v}...`);
  await import(`file://${root}/tests/${v}`);
}