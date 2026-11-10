import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "elements-react-release-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, "scripts"));
  mkdirSync(join(cwd, "packages/lib"), { recursive: true });
  for (const file of ["check-release.mjs", "sync-library-version.mjs"]) {
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
