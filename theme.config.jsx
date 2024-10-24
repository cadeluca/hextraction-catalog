import { useConfig } from "nextra-theme-docs";
import ThemeColorSelector from "@/components/color-selector";
import { ColorDropdown } from "@/components/color-dropdown";

//todo logo, actual favicon not just a glyph

export default {
  logo: <span>Hextraction Catalog</span>,
  project: {
    link: "https://github.com/cadeluca/hextraction-catalog",
  },
  docsRepositoryBase:
    "https://github.com/cadeluca/hextraction-catalog/tree/main",
  //todo would be fun to have a color picker component for people to pick whatever
  //this would get stored in localStorage, but not needed for v1
  // color {
  //   hue:
  // }
  //todo: link to official discord, specifically the channel
  // chat: {
  //   link: "the discord link here",
  //   // defaults icon to discord if no "icon" prop provided
  // }
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
  //todo see true v false for this config
  // toc: {
  //   float: false,
  // }
  feedback: {
    content: "Have a question? Submit an issue →",
    labels: "question",
  },
  navbar: {
    extraContent: (
      <>
        {/* Default Theme Switcher */}
        <ColorDropdown />
        {/* <button>Hi!</button> */}
        <ThemeColorSelector></ThemeColorSelector>
        {/* Insert your custom Color Switcher */}
        {/* <MyColorSwitcher /> */}
      </>
    ),
  },
  footer: {
    content: (
      <span>
        {/* <div className="flex w-full flex-col items-center sm:items-start"> */}
        {/* <p className="mt-6 text-xs"> */}
        MIT {new Date().getFullYear()} © Hextraction Catalog
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
