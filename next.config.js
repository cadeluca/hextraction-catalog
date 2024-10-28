import path from "node:path";
import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

// const isProduction = process.env.NODE_ENV === "production";
// const assetPrefix = isProduction ? "/hextraction-catalog" : "";
const assetPrefix = "/hextraction-catalog";
const sep = path.sep === "/" ? "/" : "\\\\";
const ALLOWED_SVG_REGEX = new RegExp(`src${sep}components${sep}icons${sep}.+\\.svg$`);

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  assetPrefix,
  basePath: assetPrefix,
  output: "export",
};

export default withNextra({
  ...nextConfig,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );
    fileLoaderRule.exclude = ALLOWED_SVG_REGEX;

    config.module.rules.push({
      test: ALLOWED_SVG_REGEX,
      use: ["@svgr/webpack"],
    });
    return config;
  },
});
