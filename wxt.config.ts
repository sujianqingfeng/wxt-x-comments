import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    permissions: [
      'cookies',
    ],
    host_permissions: [
      'https://*.x.com/*'
    ]
  },
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true,
  },
  entrypointsDir: 'src/entrypoints',
  outDir: 'dist'
});
