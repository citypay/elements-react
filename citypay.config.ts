export default {
  packageType: "library",
  release: {
    productionStrategy: "publish",
    supportsProductionBranch: false,
    preRelease: "pnpm verify",
  },
};
