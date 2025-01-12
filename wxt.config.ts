import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    permissions: [
      'cookies',
      'https://*.twitter.com/*',
      'https://*.x.com/*'
    ],
    host_permissions: [
      'https://*.twitter.com/*',
      'https://*.x.com/*'
    ]
  },
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true,
  },
  outDir: 'dist'
});
