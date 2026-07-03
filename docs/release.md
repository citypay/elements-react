# Release Checklist

This repository publishes the React package from `packages/lib` as `@citypay/elements-react`.

## Before Opening A PR

Run these locally when dependencies are installed:

```bash
nvm use
pnpm install --frozen-lockfile --config.confirmModulesPurge=false
pnpm verify
```

Confirm the dry-run package contains only the expected publish surface:

- `dist`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- root `package.json`

## GitHub Actions Setup

Add an npm automation token to the repository or organization secrets:

```text
NPM_TOKEN
```

The `Publish npm package` workflow uses the `npm` GitHub environment. Configure that environment with required
reviewers before production publishing if release approval should be explicit.

The workflow publishes with npm provenance enabled, so npm will attach a build attestation linking the package to the
GitHub Actions run that produced it.

## Publishing

Preferred release flow:

1. Merge the PR after CI passes.
2. Update `packages/lib/package.json` and `packages/lib/CHANGELOG.md` for the release version.
3. Create a GitHub release for the same version tag, for example `v0.1.0`.
4. The `Publish npm package` workflow publishes `packages/lib` to npm.

The release workflow checks that the GitHub release tag matches `packages/lib/package.json`. A package version of
`0.1.0` must be released from tag `v0.1.0`.

For a rehearsal, run the workflow manually with `dry_run` enabled.

## Versioning

Use semantic versioning:

- patch: backwards-compatible fixes
- minor: backwards-compatible components, hooks, options, or supported flows
- major: breaking API or runtime behavior changes
