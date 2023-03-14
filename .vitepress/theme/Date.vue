<script setup lang="ts">
import type { Post } from './posts.data.js'

const props = defineProps<{ date: Post['date'] }>()

// TODO maybe convert date string to "weekday, mnth day, year"

function getDateTime() {
  return new Date(props?.date?.time || Date.now()).toISOString()
}
</script>

<template>
  <dl>
    <dt class="sr-only">published on</dt>
    <dd
      class="text-base leading-6 font-medium text-gray-500 dark:text-gray-300"
    >
      <time :datetime="getDateTime()">{{ date?.string.toLowerCase() }}</time>
    </dd>
  </dl>
</template>
