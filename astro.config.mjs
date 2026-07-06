// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site institucional HostLogic — saída estática para Cloudflare Pages.
// Canonical: apex (https://hostlogic.com.br). Ver docs/INFRA_PROD_SITE_RUNBOOK.md.
export default defineConfig({
  site: 'https://hostlogic.com.br',
  output: 'static',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
