import { useConfig } from "nextra-theme-docs";
import Link from "next/link";

//todo logo, actual favicon not just a glyph

export default {
  logo: <span>Hextraction Catalog</span>,
  project: {
    link: "https://github.com/cadeluca/hextraction-catalog",
  },
  docsRepositoryBase:
    "https://github.com/cadeluca/hextraction-catalog/tree/main",
  //todo decide on a color theme
  // color {
  //   hue:
  // }
  chat: {
    link: "https://discord.com/invite/voidstarlab",
    // defaults icon to discord if no "icon" prop provided
  },
  search: {
    placeholder: "Search...",
  },
  editLink: {
    content: "Edit this page on GitHub →",
  },
  sidebar: {
    autoCollapse: true,
    toggleButton: true,
    defaultMenuCollapseLevel: 0,
  },
  //todo see true vs false for this config
  // toc: {
  //   float: false,
  // }
  feedback: {
    content: "Have a question? Submit an issue →",
    labels: "question",
  },
  footer: {
    content: (
      <span>
        {/* <div className="flex w-full flex-col items-center sm:items-start"> */}
        {/* <p className="mt-6 text-xs"> */}
        MIT {new Date().getFullYear()} © Hextraction Catalog, a project by <Link href={"https://github.com/cadeluca"}>cadeluca</Link>
        {/* </p> */}
        {/* </div> */}
      </span>
    ),
  },
  faviconGlyph: "⬣",
  head: function useHead() {
    const config = useConfig();
    const title = `${config.title} – Hextraction Catalog`;
    const description = config.frontMatter.description || "Hextraction Catalog";
    // const image = config.frontMatter.image || "https://nextra.site/og.jpeg"; //todo
    return (
      <>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        {/* <meta name="og:image" content={image} /> */}
        <meta name="msapplication-TileColor" content="#fff" />
        <meta httpEquiv="Content-Language" content="en" />
      </>
    );
  },
};
