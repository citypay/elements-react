import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ['@citypay/sdk'],
    logging: {
        incomingRequests: false,
    }
};

export default nextConfig;
