import { LinkArrowIcon } from 'nextra/icons'
import { useMDXComponents } from '../mdx-components'

// eslint-disable-next-line react-hooks/rules-of-hooks -- isn't react hook
const { code: Code } = useMDXComponents()


const ExternalLink = ({ children }) => {
  return (
    <>
      {children}&thinsp;
      <LinkArrowIcon
        // based on font-size
        height="1em"
        className="x:inline x:align-baseline x:shrink-0"
      />
    </>
  )
}

export default {
  index: {
    type: 'page',
    display: 'hidden',
    theme: {
      typesetting: 'article'
    }
  },
  contributing: {
    type: 'page',
    theme: {
      typesetting: 'article'
    }
  },
  'ways-to-play': {
    type: 'page',
    // items: {
    //   index: '',
    // }
  },
  'tiles': {
    type: 'page',
    items: {
      'tile-table': {
        theme: {
          layout: "full",
          toc: false,
          sidebar: false,
        },
      }
    }
  },
}