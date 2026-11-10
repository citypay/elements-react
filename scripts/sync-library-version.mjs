import { readFileSync, writeFileSync } from "node:fs";

// npm version is used for both the stable release and the next cycle.
// Keep the package actually published to npm in the same version commit.
const root = JSON.parse(readFileSync("package.json", "utf8"));
const file = "packages/lib/package.json";
const library = JSON.parse(readFileSync(file, "utf8"));
library.version = root.version;
writeFileSync(file, JSON.stringify(library, null, 2) + "\n");
console.log(`@citypay/elements-react version: ${root.version}`);
