/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Importing env files here to validate on build
import "./src/env.mjs";
import "@acme/auth/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/api", "@acme/auth", "@acme/db"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = 'source-map'
    }
    return config
  },
};

export default config;