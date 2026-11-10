import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const args = process.argv.slice(2).filter((arg) => arg !== "--");
if (args.includes("--help")) {
  console.log("Usage: pnpm release:draft [X.Y.Z]\nValidate and push a release branch/tag, then create a GitHub draft. Nothing is published to npm.");
  process.exit(0);
}
assert.ok(args.length <= 1, "Pass at most one release version");
const rootVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
const version = args[0] ?? rootVersion.replace(/-(next|beta|rc).*$/, "");
assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "Use a stable X.Y.Z version");
assert.equal(rootVersion.replace(/-(next|beta|rc).*$/, ""), version, "Release the current version; update package versions first to choose another");

const branch = `release/${version}`;
const tag = `v${version}`;
const repo = "citypay/elements-react";
const output = (command, commandArgs, env = process.env) => execFileSync(command, commandArgs, { encoding: "utf8", env }).trim();
const run = (command, commandArgs, env = process.env) => execFileSync(command, commandArgs, { stdio: "inherit", env });
const git = (...commandArgs) => output("git", commandArgs);
const exists = (ref) => spawnSync("git", ["show-ref", "--verify", "--quiet", ref]).status === 0;
const startingBranch = git("branch", "--show-current");
assert.equal(startingBranch, "main", "Run release:draft from main");
assert.equal(git("status", "--porcelain"), "", "Commit or stash changes before drafting a release");
assert.match(git("config", "--get", "remote.origin.url"), /^(https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)citypay\/elements-react(?:\.git)?$/, "origin must be citypay/elements-react on GitHub");

// Test the credential actually used for API calls. A stale environment token can
// override a valid saved login even when `gh auth status` reports an account.
let ghEnv = { ...process.env };
const authenticated = () => spawnSync("gh", ["api", "--hostname", "github.com", "user", "--silent"], { env: ghEnv, stdio: "ignore" }).status === 0;
if (!authenticated()) {
  delete ghEnv.GH_TOKEN;
  delete ghEnv.GITHUB_TOKEN;
  assert.ok(authenticated(), "GitHub CLI authentication failed; run gh auth login before retrying");
  console.log("Using saved GitHub login because the environment token failed.");
}
const gh = (...commandArgs) => output("gh", commandArgs, ghEnv);
run("git", ["fetch", "origin"]);
assert.equal(git("rev-parse", "HEAD"), git("rev-parse", "origin/main"), "main must match origin/main before drafting");

// Check API access and existing drafts before changing any local files.
const releases = JSON.parse(gh("api", `repos/${repo}/releases`, "--paginate", "--slurp")).flat();
const existingRelease = releases.find((release) => release.tag_name === tag);
assert.ok(!existingRelease || existingRelease.draft, `${tag} is already published; start a new version`);
const remoteRefs = git("ls-remote", "origin", `refs/heads/${branch}`, `refs/tags/${tag}`);
assert.ok(!existingRelease || remoteRefs.includes(`refs/tags/${tag}`), "Existing draft has no remote tag; repair the release before retrying");

let switched = false;
try {
  if (exists(`refs/heads/${branch}`)) {
    run("git", ["checkout", branch]);
  } else if (exists(`refs/remotes/origin/${branch}`)) {
    run("git", ["checkout", "--track", `origin/${branch}`]);
  } else {
    assert.ok(!exists(`refs/tags/${tag}`) && !remoteRefs.includes(`refs/tags/${tag}`), `${tag} already exists without its release branch; do not move it`);
    run("git", ["checkout", "-b", branch]);
  }
  switched = true;
  const branchVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
  const hasTag = exists(`refs/tags/${tag}`);
  if (branchVersion !== version) {
    assert.ok(!hasTag, "The existing tag has a different package version; do not retag it");
    run("npm", ["version", version, "--no-git-tag-version"]);
  }
  run("pnpm", ["verify"]);
  if (git("status", "--porcelain")) {
    run("git", ["add", "package.json", "packages/lib/package.json"]);
    run("git", ["commit", "-m", `chore: release ${version}`]);
  }
  assert.equal(git("status", "--porcelain"), "", "Validation left unexpected changes; inspect before retrying");
  if (hasTag) {
    assert.equal(git("rev-parse", `${tag}^{commit}`), git("rev-parse", "HEAD"), "Existing release tag differs from branch HEAD; do not move it");
  } else {
    run("git", ["tag", tag]);
  }
  run("node", ["scripts/check-release.mjs", "--stable"]);
  run("git", ["push", "--atomic", "origin", `HEAD:refs/heads/${branch}`, `refs/tags/${tag}`]);
  if (!existingRelease) {
    run("gh", ["release", "create", tag, "--repo", repo, "--target", branch, "--draft", "--generate-notes", "--verify-tag", "--title", tag], ghEnv);
  }
  const release = JSON.parse(gh("release", "view", tag, "--repo", repo, "--json", "isDraft,url,tagName"));
  assert.equal(release.isDraft, true, "Expected an unpublished draft release");
  console.log(`Draft ready: ${release.url}\nPublish it in GitHub to trigger the npm workflow. main remains at ${rootVersion}.`);
} finally {
  if (switched && git("status", "--porcelain") === "") {
    run("git", ["checkout", startingBranch]);
  } else if (switched) {
    console.error(`Left ${branch} checked out with changes so a failed preparation can be inspected. No automatic reset was performed.`);
  }
}
