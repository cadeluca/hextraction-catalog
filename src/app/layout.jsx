import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Search, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { HexIcon } from '@/components/icons'
import './globals.css'

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}


const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>
const navbar = (
  <Navbar
    logo={<span>⬣ Hextraction Catalog</span>}
    projectLink="https://github.com/cadeluca/hextraction-catalog"
    // projectIcon={<HexIcon />}
    chatLink="https://discord.com/invite/voidstarlab"
    // chatIcon should default to discord
  />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Hextraction Catalog, a project by cadeluca.</Footer>

const search = <Search
  placeholder="looking..."
/>

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
        faviconGlyph={"⬣"}
        color={{
          hue: 146,
          saturation: 66,
          lightness: {
            light: 61,
            dark: 61
          }
        }}
        backgroundColor={{
          dark: "#080c0b"
        }}
      >
        {/* <link rel="shortcut icon" href="./components/icons/icon.svg"/> */}
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/cadeluca/hextraction-catalog/tree/main"
          footer={footer}
          editLink={null}
          search={search}
          sidebar={{
            autoCollapse: true,
            toggleButton: true,
            defaultMenuCollapseLevel: 1 // was 0 before, compare
          }}
          toc={{
            backToTop: true,
            title: "my contents yo",
            extraContent: "my extra content",
            float: false // todo verify this behavior
          }}
          feedback={{
            content: "Have a question or comment? Give us feedback",
            labels: "feedback",
          }}
          //notfoundpage -> labels, content
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}