# HostLogic — Site institucional

Site comercial/institucional do HostLogic, **desacoplado** do app (`app.hostlogic.com.br`).
Tecnologia: [Astro](https://astro.build) (saída estática), hospedagem em **Cloudflare Pages**.

> Esta pasta nasce dentro do repositório do app apenas como scaffold. Está no `.gitignore` da raiz
> para NÃO ser versionada junto com o app. O destino é um **repositório separado** `hostlogic-site`.

## Estado atual

Home de teste (bruta), com:

- Logo + tagline + tema escuro consistente com o app.
- Resumo das áreas do sistema (cards).
- Contato **somente por e-mail e telefone** (sem formulário/automação nesta fase).
- Link "Acessar o sistema" -> `https://app.hostlogic.com.br`.
- Links legais -> `/privacidade` e `/termos` do app (canónicos).
- Stubs preparados: `/demo` (vídeo), `/blog`, `/adesivos` (captura de lead futura).

Marketing comercial completo e captura automática de leads ficam para fase posterior
(ver `../docs/SITE_FUTURE_INTEGRATIONS.md`).

## Desenvolvimento local

```bash
cd hostlogic-site
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
npm run preview  # serve dist/ localmente
```

## Configuração

Edite `src/consts.ts`:

- `CONTACT.phoneHref` / `CONTACT.phoneDisplay` — **preencher o telefone real** antes do go-live.
- `APP_URL` — URL do produto (já = `https://app.hostlogic.com.br`).
- `SITE.url` — canonical (apex vs www, conforme decisão no runbook).

## Tornar repositório separado e publicar (Cloudflare Pages)

```bash
cd hostlogic-site
git init
git add .
git commit -m "chore: scaffold site institucional HostLogic (home de teste)"
git remote add origin git@github.com:<org>/hostlogic-site.git
git branch -M main
git push -u origin main
```

Depois, em Cloudflare -> Workers & Pages -> Pages -> Connect to Git -> `hostlogic-site`:

- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`

Custom domains: `hostlogic.com.br` e `www.hostlogic.com.br` (ver `../docs/INFRA_PROD_SITE_RUNBOOK.md`, Fase 4).

## Estrutura

```
hostlogic-site/
  astro.config.mjs
  src/
    consts.ts            # contato, URLs, navegação (fonte da verdade)
    layouts/BaseLayout.astro
    pages/
      index.astro        # home de teste
      demo.astro         # stub do vídeo
      adesivos.astro     # stub captura de lead (futuro)
      blog/index.astro   # stub do blog
    styles/global.css
  public/
    assets/              # logos copiados do app
    robots.txt
    _headers             # cabeçalhos de segurança (Cloudflare Pages)
```
