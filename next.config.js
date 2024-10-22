import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
})

const isProduction = process.env.NODE_ENV === "production";
const assetPrefix = isProduction ? "/hextaction-catalog" : "";

const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  assetPrefix,
  basePath: assetPrefix,
  output: "export",
};

export default {
  ...withNextra(),
  ...nextConfig,
}