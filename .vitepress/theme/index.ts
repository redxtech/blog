import './tailwind.postcss'
import './tt-norms.css'

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

import DefaultTheme from 'vitepress/theme-without-fonts'
import './style.css'

export default {
  ...DefaultTheme,
  Layout,
  NotFound
}
