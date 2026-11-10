import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = JSON.parse(readFileSync("package.json", "utf8"));
const library = JSON.parse(readFileSync("packages/lib/package.json", "utf8"));

assert.equal(library.name, "@citypay/elements-react", "Unexpected npm package name");
assert.equal(root.private, true, "The workspace root must not be published");
assert.equal(library.private, false, "The React library must be publishable");
assert.equal(library.version, root.version, "Root and library versions must match; run npm version through the release script");

if (process.argv.includes("--stable")) {
  assert.match(library.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "Publishing requires a stable X.Y.Z version");
  const tag = `v${library.version}`;
  if (process.env.RELEASE_TAG) {
    assert.equal(process.env.RELEASE_TAG, tag, "GitHub release tag must match the library version");
  }
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
  git("merge-base", "--is-ancestor", tag, "HEAD");
  // The published package contents must match their release tag.
  git("diff", "--exit-code", tag, "HEAD", "--", "package.json", "packages/lib", "pnpm-lock.yaml");
  console.log(`Verified stable release ${tag} and tagged library contents`);
} else {
  console.log(`Verified matching workspace and library version ${library.version}`);
}
