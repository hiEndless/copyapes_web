export default {
  build: {
    esbuild: {
      external: ['@swc/core', '@swc/wasm', '@swc/core-darwin-x64', 'node:diagnostics_channel']
    }
  }
}
