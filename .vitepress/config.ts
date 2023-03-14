import { defineConfig } from 'vitepress'
import anchor from 'markdown-it-anchor'

export default defineConfig({
  title: "gabe's blog",
  description:
    'where i talk about linux, programming, and other fun computery stuff',
  // TODO add opengraph metadata
  // TODO change all metadata
  head: [
    ['meta', { name: 'twitter:site', content: '@gabedunn_' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    [
      'meta',
      {
        name: 'twitter:image',
        content: 'https://blog.gabedunn.dev/logo.png'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
    // TODO add own tracking script
    // [
    //   'script',
    //   {
    //     src: '',
    //     'data-site': '',
    //     'data-spa': '',
    //     defer: ''
    //   }
    // ]
  ],
  markdown: {
    theme: 'dracula',
    anchor: {
      permalink: anchor.permalink.linkAfterHeader({
        style: 'aria-labelledby',
        symbol: '🔗',
        space: true
      })
    }
  },
  srcExclude: ['readme.md', 'license.md']
})
