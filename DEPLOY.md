# Fase 4 — Publicar o site (Cloudflare Pages)

Checklist operacional. Runbook completo: `../docs/INFRA_PROD_SITE_RUNBOOK.md`.

## Antes de publicar

1. Editar `src/consts.ts` — telefone comercial real (`phoneHref` em E.164, `phoneDisplay` legível).
2. Local: `npm install && npm run build` (deve gerar `dist/` com 4 páginas).

## Passo A — Repositório GitHub

Org sugerida (mesma do app): **SysNapse-ai**.

```bash
cd /home/hl/dev/anfitriao-mais/hostlogic-site
git init
git add .
git commit -m "chore: scaffold site institucional HostLogic (home de teste)"
```

No GitHub: **New repository** → nome `hostlogic-site` → **sem** README (já existe local).

```bash
git remote add origin git@github.com:SysNapse-ai/hostlogic-site.git
git branch -M main
git push -u origin main
```

(Se usar HTTPS: `https://github.com/SysNapse-ai/hostlogic-site.git`.)

## Passo B — Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → aba **Pages**.
2. **Create** → **Connect to Git** → GitHub → autorizar → repo **`hostlogic-site`**.
3. **Build settings:**

   | Campo | Valor |
   |-------|--------|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (raiz do repo) |

4. **Environment variables** (Settings → Environment variables → Production):

   | Nome | Valor |
   |------|--------|
   | `NODE_VERSION` | `22` |

   (Alternativa: o ficheiro `.node-version` na raiz do repo.)

5. **Save and Deploy** — aguardar build verde.
6. Anotar a URL temporária: `https://<projeto>.pages.dev` — abrir no browser e validar a home.

## Passo C — Domínios customizados (Pages)

No projeto Pages → **Custom domains** → **Set up a custom domain**:

1. `hostlogic.com.br`
2. `www.hostlogic.com.br`

A Cloudflare indica os alvos CNAME (geralmente `<projeto>.pages.dev`). **Não** altere DNS manualmente se a zona já estiver na mesma conta — o Pages pode criar os registros.

## Passo D — DNS (só se o Pages não criar automaticamente)

Zona **hostlogic.com.br** → **DNS → Records**:

| Tipo | Nome | Conteúdo | Proxy |
|------|------|----------|-------|
| CNAME | `@` | `<projeto>.pages.dev` | Ligado (laranja) |
| CNAME | `www` | `<projeto>.pages.dev` | Ligado (laranja) |

**Remover** o encaminhamento antigo de `@` e `www` para `th.hostlogic.com.br`.

Manter intactos: `th`, `mg`, `email.mg`, `app` (quando existir).

## Passo E — Validação

```bash
curl -sI https://www.hostlogic.com.br | head -5
# esperado: 301 → https://hostlogic.com.br/...

curl -sI https://hostlogic.com.br | head -5
# esperado: 200 (HTML do site), não 403

curl -s https://app.hostlogic.com.br/api/health
# esperado: {"status":"ok"}
```

No browser:

- Home com logo, cards, contato e-mail/telefone.
- **Acessar o sistema** → `https://app.hostlogic.com.br`
- Privacidade/Termos → app `/privacidade` e `/termos`

## Passo F — UptimeRobot (opcional, Fase 5)

Monitor HTTP: `https://hostlogic.com.br` (intervalo 5 min).

## Rollback

Se algo falhar: repor `@`/`www` para `th.hostlogic.com.br` no DNS (volta ao estado anterior).
