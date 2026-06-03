// @ts-check
import { defineConfig } from 'astro/config';

// Site institucional HostLogic — saída estática para Cloudflare Pages.
// Canonical pendente (apex vs www): ajustar `site` quando decidido. Ver docs/INFRA_PROD_SITE_RUNBOOK.md.
export default defineConfig({
  site: 'https://hostlogic.com.br',
  output: 'static',
  build: {
    format: 'directory',
  },
});
