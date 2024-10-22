import { useConfig } from "nextra-theme-docs";

export default {
  logo: <span>Hextraction Catalog</span>,
  project: {
    link: 'https://github.com/cadeluca/hextraction-catalog',
  },
  search: {
    placeholder: "Search...",
  },
  editLink: {
    component: null,
  },
  sidebar: {
    autoCollapse: true,
    toggleButton: true,
    defaultMenuCollapseLevel: 2,
  },
  feedback: {
    content: null,
  },
  footer: {
    component: null,
  },
  faviconGlyph: "⬣",
  head: function useHead() {
    const config = useConfig();
    const title = `${config.title} – Hextraction Catalog`;
    const description = config.frontMatter.description || "Hextraction Catalog";
    const image = config.frontMatter.image || "https://nextra.site/og.jpeg"; //todo
    return (
      <>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta name="og:image" content={image} />

        <meta name="msapplication-TileColor" content="#fff" />
        <meta httpEquiv="Content-Language" content="en" />
      </>
    );
  },
};
