<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()

const getMastodonURL = (handle: string) => {
  const [user, instance] = handle.split('@')
  return `https://${instance}/@${user}`
}
</script>

<template>
  <dl
    class="pt-6 pb-10 xl:pt-11 xl:border-b xl:border-gray-200 dark:xl:border-slate-200/5"
  >
    <dt class="sr-only">authors</dt>
    <dd>
      <ul
        class="flex justify-center xl:block space-x-8 sm:space-x-12 xl:space-x-0 xl:space-y-8"
      >
        <li class="flex items-center space-x-2">
          <img
            v-if="frontmatter.gravatar"
            :src="'https://gravatar.com/avatar/' + frontmatter.gravatar"
            alt="author image"
            class="w-10 h-10 rounded-full"
          />
          <img
            v-else-if="frontmatter.avatar"
            :src="frontmatter.avatar"
            alt="author image"
            class="w-10 h-10 rounded-full"
          />
          <dl class="text-sm font-medium leading-5 whitespace-nowrap">
            <dt class="sr-only">name</dt>
            <dd class="text-gray-900 dark:text-white">
              {{ frontmatter.author }}
            </dd>
            <dt v-if="frontmatter.mastodon" class="sr-only">mastodon</dt>
            <dd v-if="frontmatter.mastodon">
              <a
                :href="getMastodonURL(frontmatter.mastodon)"
                target="_blank"
                rel="noopnener noreferrer"
                class="link"
                v-text="frontmatter.mastodon"
              />
            </dd>
            <dt v-if="frontmatter.twitter" class="sr-only">twitter</dt>
            <dd v-if="frontmatter.twitter">
              <a
                :href="'https://twitter.com/' + frontmatter.twitter"
                target="_blank"
                rel="noopnener noreferrer"
                class="link"
                v-text="frontmatter.twitter"
              />
            </dd>
          </dl>
        </li>
      </ul>
    </dd>
  </dl>
</template>
