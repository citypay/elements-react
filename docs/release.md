# React library releases

This repository publishes `packages/lib` as `@citypay/elements-react`. The
workspace root is private. The Vite demo and its backend deploy separately.

## Draft a release

From a clean, committed and pushed `main` branch:

```bash
pnpm release:draft
```

The version defaults to the stable part of the root version: `1.0.8-next`
prepares `1.0.8`. You can make it explicit with `pnpm release:draft 1.0.8`.
The command uses Git, npm, pnpm and an authenticated GitHub CLI (`gh`).

It performs these steps:

1. Verifies the working tree, origin repository, GitHub authentication and that
   local `main` matches `origin/main`.
2. Creates or resumes `release/X.Y.Z` and sets both root and library versions to
   `X.Y.Z` using the npm version hook.
3. Runs `pnpm verify`, including release tests, library/demo builds, lint and
   package inspection, then commits the version changes.
4. Creates `vX.Y.Z` and pushes the branch and tag together without force-pushing.
5. Creates a GitHub draft with generated notes, or returns the existing draft.
6. Returns to `main` after successful preparation.

If an environment token fails, the command tries the saved GitHub CLI login.
Existing tags are never moved. A published GitHub release cannot be redrafted.
If preparation fails with local edits, it leaves the release branch checked out
for inspection. Finish or undo those edits before returning to `main` and
retrying. A retry from clean `main` can resume an already committed/tagged draft.

The command does not use the shared `npm-release.sh`, create a production branch,
merge into main, or publish to npm. There is no repository-local npm-release
script. Update `packages/lib/CHANGELOG.md` before starting.

## Publish the draft

Review the draft's tag and notes, then click **Publish release** in GitHub.
Only the `release.published` event triggers automatic npm publication. Saving a
GitHub draft, pushing a release tag, or pushing `main` does not publish a package.

`.github/workflows/publish-npm.yml` uses the existing `npm` environment. It:

1. Installs frozen workspace dependencies using the root pnpm version.
2. Checks that the release tag, root version and library version agree and are
   stable, and that the package contents match the tag.
3. Builds and lints the library and inspects the package contents.
4. Publishes `@citypay/elements-react` publicly with provenance and the `latest` tag.

Keep the npm trusted publisher configured for GitHub owner `citypay`, repository
`elements-react`, workflow `publish-npm.yml`, and environment `npm` where specified.
The job grants `id-token: write`; an existing `NPM_TOKEN` secret is also passed
through if configured. No credentials belong in the repository.

For a rehearsal, use **Actions → Publish npm package → Run workflow** and leave
`dry_run` enabled. A rehearsal may use a branch; manual live publication requires
a stable release tag. A dry run does not prove npm publishing authentication works.

Check the workflow result and registry after publication:

```bash
npm view @citypay/elements-react version dist-tags --json
```

npm versions cannot be overwritten. If publication fails, check whether the
version reached npm before retrying. Fix a published package with a new version;
do not move an existing release tag or reuse its version. The old `v1.0.7` tag
has mismatched root/library versions and must not be used to publish the library.

## Start the next development version

After publication, merge `release/X.Y.Z` into `main` through the normal review
flow, then advance to the next version, for example:

```bash
npm version 1.0.9-next --no-git-tag-version
git add package.json packages/lib/package.json
git commit -m 'chore: bump version to 1.0.9-next'
git push origin main
```

The root `version` hook keeps the library version aligned and stages its manifest.
Do not pass `--ignore-scripts`. `pnpm release:check` detects version drift.
Use semantic versioning: patch for compatible fixes, minor for compatible
features and major for breaking changes.
