<template>
  <div class="mx-auto my-12 text-center">
    <!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" -->
    <button
      type="button"
      :class="toggleState.dark ? 'bg-indigo-600' : 'bg-gray-200'"
      class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-pressed="false"
      @click="handleToggle"
    >
      <span class="sr-only">Use setting</span>
      <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
      <span
        :class="toggleState.dark ? 'translate-x-5' : 'translate-x-0'"
        class="pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
      >
        <!-- Enabled: "opacity-0 ease-out duration-100", Not Enabled: "opacity-100 ease-in duration-200" -->
        <span
          :class="
            toggleState.dark
              ? 'opacity-0 ease-out duration-100'
              : 'opacity-100 ease-in duration-200'
          "
          class="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          aria-hidden="true"
        >
          <svg
            class="bg-white h-3 w-3 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        <!-- Enabled: "opacity-100 ease-in duration-200", Not Enabled: "opacity-0 ease-out duration-100" -->
        <span
          :class="
            toggleState.dark
              ? 'opacity-100 ease-in duration-200'
              : 'opacity-0 ease-out duration-100'
          "
          class="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          aria-hidden="true"
        >
          <svg
            class="bg-white h-3 w-3 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            />
          </svg>
        </span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'

// TODO: fix button position

const toggleState = reactive({
  dark:
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
})

const state = reactive({ count: 0 })

watch(
  () => state.count,
  (count) => {
    if (count === 5) {
      state.count = 0
      localStorage.removeItem('theme')
      setTimeout(() => (state.count = 0), 5000)
      console.log('theme unset!')
    }
  }
)

onMounted(() => {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const handleToggle = () => {
  localStorage.theme = toggleState.dark ? 'light' : 'dark'
  toggleState.dark
    ? document.documentElement.classList.remove('dark')
    : document.documentElement.classList.add('dark')
  toggleState.dark = !toggleState.dark
  state.count++
}
</script>
