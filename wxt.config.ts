import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    permissions: ['storage', 'tabs'],
    host_permissions: ['*://*.twitter.com/*', '*://*.x.com/*']
  },
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true,
  },
  outDir: 'dist'
});
