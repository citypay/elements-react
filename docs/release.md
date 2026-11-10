# React library releases

This repository publishes `packages/lib` as `@citypay/elements-react`. The
workspace root is private. The Vite demo and its backend deploy separately.

## Prepare a release

Use the shared `npm-release.sh` on your PATH from a clean, committed and pushed
`main` branch. There is no separate repository release command or local copy of
that script.

```bash
npm-release.sh
```

The current root version determines the release: `1.0.8-next` prepares `1.0.8`.
Update `packages/lib/CHANGELOG.md` before starting. Git, npm, pnpm and an
authenticated GitHub CLI (`gh`) are required.

`citypay.config.ts` declares this as a library, runs `pnpm verify` before release
mutations, and disables the production-branch step. The shared script:

1. Runs the pre-release checks: version alignment, release tests, library/demo
   builds, lint and package inspection.
2. Creates `release/X.Y.Z` and sets the stable version using `npm version`.
3. Archives release notes and pushes the release branch and `vX.Y.Z` tag.
4. Offers to create a GitHub draft release. Answer **yes**.
5. Merges the release back into `main`, bumps the next development version
   (for example, `1.0.9-next`) and pushes `main`.

The root `version` lifecycle hook updates and stages `packages/lib/package.json`
whenever the shared script calls `npm version`. This keeps both manifests in the
same stable-release and next-version commits. Do not use `--ignore-scripts`.

If a stale environment token overrides a valid saved GitHub CLI login, use:

```bash
env -u GITHUB_TOKEN -u GH_TOKEN npm-release.sh
```

For noninteractive draft creation, the shared script supports
`CREATE_GITHUB_RELEASE=1`. Creating the draft does not publish the npm package.
There is no production branch in this release flow.

## Publish the draft

Review the draft's tag and notes, then click **Publish release** in GitHub.
Only the `release.published` event triggers automatic npm publication. Saving a
GitHub draft, pushing a release tag, or pushing `main` does not publish a package.
The workflow builds the tagged release, even though `main` has already advanced
to the next development version.

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

Use semantic versioning: patch for compatible fixes, minor for compatible
features and major for breaking changes.
