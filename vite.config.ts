import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type UserConfig } from 'vite';

export default defineConfig((): UserConfig => {
  const pages: string[] = JSON.parse(readFileSync('.routes.json', 'utf8'));
  return {
    appType: 'mpa',
    build: { rollupOptions: { input: pages.map((entry) => resolve(entry)) } },
  };
});
