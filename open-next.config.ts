// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config: any = defineCloudflareConfig({});

config.build = config.build || {};
config.build.esbuild = config.build.esbuild || {};
config.build.esbuild.minify = true;
config.build.esbuild.external = ['@swc/core', '@swc/wasm', '@swc/core-darwin-x64', 'node:diagnostics_channel', '@vercel/og', 'yoga.wasm', 'resvg.wasm'];

export default config;
