import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "elements-react-release-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, "scripts"));
  mkdirSync(join(cwd, "packages/lib"), { recursive: true });
  for (const file of ["check-release.mjs", "sync-library-version.mjs", "draft-release.mjs"]) {
    copyFileSync(new URL(file, import.meta.url), join(cwd, "scripts", file));
  }
  const root = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));
  writeFileSync(join(cwd, "package.json"), JSON.stringify({
    name: "release-test", private: true, version: "1.0.8-next",
    scripts: { version: root.scripts.version },
  }));
  writeFileSync(join(cwd, "packages/lib/package.json"), JSON.stringify({
    name: "@citypay/elements-react", private: false, version: "1.0.8-next",
  }));
  const run = (command, args, expected = 0, env = process.env) => {
    const result = spawnSync(command, args, { cwd, env, encoding: "utf8", timeout: 30000 });
    assert.equal(result.status, expected, result.stdout + result.stderr);
    return result.stdout.trim();
  };
  run("git", ["init", "--quiet", "-b", "main"]);
  run("git", ["config", "user.name", "Release test"]);
  run("git", ["config", "user.email", "release-test@example.invalid"]);
  run("git", ["config", "commit.gpgsign", "false"]);
  run("git", ["add", "."]);
  run("git", ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "fixture"]);
  return { cwd, run };
}

test("npm-version flow stages the library for both stable and next versions", (t) => {
  const { cwd, run } = fixture(t);
  for (const version of ["1.0.8", "1.0.9-next"]) {
    run("npm", ["version", version, "--no-git-tag-version"]);
    assert.equal(JSON.parse(readFileSync(join(cwd, "packages/lib/package.json"))).version, version);
    assert.equal(run("git", ["diff", "--cached", "--name-only"]), "packages/lib/package.json");
    run("node", ["scripts/check-release.mjs"]);
    run("git", ["add", "package.json"]);
    run("git", ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", version]);
    if (version === "1.0.8") {
      run("git", ["tag", "v1.0.8"]);
      run("node", ["scripts/check-release.mjs", "--stable"]);
      run("git", ["-c", "commit.gpgsign=false", "commit", "--allow-empty", "--quiet", "-m", "promotion"]);
      run("node", ["scripts/check-release.mjs", "--stable"]);
    } else {
      run("node", ["scripts/check-release.mjs", "--stable"], 1);
    }
  }
});

test("release checks reject mismatched versions, missing tags and changed tagged contents", (t) => {
  const { cwd, run } = fixture(t);
  const libFile = join(cwd, "packages/lib/package.json");
  const library = JSON.parse(readFileSync(libFile));
  writeFileSync(libFile, JSON.stringify({ ...library, version: "1.0.7-next" }));
  run("node", ["scripts/check-release.mjs"], 1);
  run("npm", ["version", "1.0.8", "--no-git-tag-version"]);
  run("node", ["scripts/check-release.mjs", "--stable"], 1);
  run("git", ["add", "."]);
  run("git", ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "stable"]);
  run("git", ["tag", "v1.0.8"]);
  run("node", ["scripts/check-release.mjs", "--stable"], 1, { ...process.env, RELEASE_TAG: "v1.0.7" });
  writeFileSync(join(cwd, "packages/lib/unreleased.js"), "// not in the release tag\n");
  run("git", ["add", "."]);
  run("git", ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "untagged change"]);
  run("node", ["scripts/check-release.mjs", "--stable"], 1);
});

test("draft command pushes matching versions, resumes drafts and refuses published releases or tag changes", (t) => {
  const { cwd, run } = fixture(t);
  const support = mkdtempSync(join(tmpdir(), "elements-release-services-"));
  t.after(() => rmSync(support, { recursive: true, force: true }));
  const remote = join(support, "remote.git");
  run("git", ["init", "--bare", "--quiet", remote]);
  run("git", ["config", `url.${remote}.insteadOf`, "https://github.com/citypay/elements-react.git"]);
  run("git", ["remote", "add", "origin", "https://github.com/citypay/elements-react.git"]);
  run("git", ["push", "-u", "origin", "main"]);

  // Only Git/npm run for real. GitHub and the already-tested build are local stubs.
  const bin = join(support, "bin");
  mkdirSync(bin);
  const state = join(support, "release.json");
  writeFileSync(join(bin, "gh"), `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const file = process.env.RELEASE_TEST_STATE;
if (args[0] === 'api' && args.includes('user')) {
  process.exit(process.env.GH_TOKEN || process.env.GITHUB_TOKEN ? 1 : 0);
} else if (args[0] === 'api' && args[1] === 'repos/citypay/elements-react/releases') {
  console.log(JSON.stringify([fs.existsSync(file) ? [JSON.parse(fs.readFileSync(file))] : []]));
} else if (args[0] === 'release' && args[1] === 'create') {
  if (!args.includes('--draft') || !args.includes('--verify-tag') || fs.existsSync(file)) process.exit(1);
  fs.writeFileSync(file, JSON.stringify({ tag_name: args[2], draft: true, url: 'https://example.invalid/draft' }));
} else if (args[0] === 'release' && args[1] === 'view') {
  const release = JSON.parse(fs.readFileSync(file));
  console.log(JSON.stringify({ tagName: release.tag_name, isDraft: release.draft, url: release.url }));
} else process.exit(1);
`);
  writeFileSync(join(bin, "pnpm"), `#!/usr/bin/env node
if (process.argv[2] !== 'verify') process.exit(1);
require('node:child_process').execFileSync(process.execPath, ['scripts/check-release.mjs'], { stdio: 'inherit' });
`);
  chmodSync(join(bin, "gh"), 0o755);
  chmodSync(join(bin, "pnpm"), 0o755);
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, RELEASE_TEST_STATE: state, GITHUB_TOKEN: "expired-test-token", GH_TOKEN: "expired-test-token" };
  const draft = (expected = 0) => run("node", ["scripts/draft-release.mjs"], expected, env);
  draft();
  assert.equal(run("git", ["branch", "--show-current"]), "main");
  assert.equal(JSON.parse(readFileSync(join(cwd, "package.json"))).version, "1.0.8-next");
  assert.equal(JSON.parse(run("git", ["show", "v1.0.8:packages/lib/package.json"])).version, "1.0.8");
  const tagSha = run("git", ["rev-parse", "v1.0.8"]);
  assert.ok(run("git", ["ls-remote", "origin", "refs/tags/v1.0.8"]).startsWith(tagSha));
  assert.equal(JSON.parse(readFileSync(state)).draft, true);
  draft(); // Existing draft is returned without recreating it.

  run("git", ["checkout", "release/1.0.8"]);
  run("git", ["-c", "commit.gpgsign=false", "commit", "--allow-empty", "--quiet", "-m", "different head"]);
  run("git", ["checkout", "main"]);
  draft(1);
  assert.equal(run("git", ["rev-parse", "v1.0.8"]), tagSha);
  assert.equal(run("git", ["branch", "--show-current"]), "main");
  const release = JSON.parse(readFileSync(state));
  writeFileSync(state, JSON.stringify({ ...release, draft: false }));
  draft(1);
  assert.equal(run("git", ["branch", "--show-current"]), "main");
});
