// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      //@ts-ignore
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:1337'
    }
  }
})
