import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { Feed } from 'feed'
import { fileURLToPath } from 'url'
import postsData from './theme/posts.data.js'

const url = `https://blog.gabedunn.dev`
const dirname = path.dirname(fileURLToPath(import.meta.url))

const feed = new Feed({
  title: "gabe's blog.",
  description:
    'where i talk about linux, programming, and other fun computery stuff',
  id: url,
  link: url,
  language: 'en',
  image: 'https://blog.gabedunn.dev/logo.png',
  favicon: `${url}/favicon.ico`,
  copyright: 'Copyright (c) 2021-present, Gabe Dunn'
})

postsData.load(true).then((posts) => {
  posts.forEach((post) => {
    const file = path.resolve(dirname, `dist${post.href}`)
    const rendered = readFileSync(file, 'utf-8')
    const content = rendered.match(
      /<div [^<>]+?class="prose[^<>]+?>([\s\S]*)<\/div><\/div><footer/
    )

    if (!content) {
      throw new Error(`no content match found for file ${post.href}`)
    }

    feed.addItem({
      title: post.title,
      id: `${url}${post.href}`,
      link: `${url}${post.href}`,
      description: post.excerpt,
      content: content[1],
      author: [
        {
          name: post.data.author,
          link: post.data.twitter
            ? `https://twitter.com/${post.data.twitter}`
            : undefined
        }
      ],
      date: post.data.date
    })
  })

  writeFileSync(path.resolve(dirname, 'dist/feed.rss'), feed.rss2())
})
