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

## Passo B — Cloudflare (Git → Workers & Pages unificado)

O painel pode mostrar **"Configure your Worker project"** com `npx wrangler deploy` — isso é normal em 2026.
O repo inclui `wrangler.toml` com `[assets] directory = "./dist"` (site Astro estático).

1. **Workers & Pages** → **Create** → **Connect to Git** → repo **`hostlogic-site`**.
2. **Set up your application:**

   | Campo | Valor |
   |-------|--------|
   | Nome do projeto | `hostlogic-site` |
   | Comando da build | `npm run build` |
   | Comando de implantação | `npx wrangler deploy` |
   | Caminho (avançado) | vazio (raiz do repo) |

3. **Variáveis de ambiente** (avançado / Production):

   | Nome | Valor |
   |------|--------|
   | `NODE_VERSION` | `22` |
   | `GEMINI_API_KEY` | chave da Google AI Studio (modelo `gemini-2.5-flash`) — definir via `wrangler secret put GEMINI_API_KEY` ou **Settings → Variables → Encrypt** no painel |

   > A `GEMINI_API_KEY` é um **secret** (Encrypt). Nunca commitá-la nem pôr no `wrangler.toml`.
   > Local: criar `.dev.vars` (já no `.gitignore`) com `GEMINI_API_KEY="..."` para `wrangler dev`.

4. **Rate Limiting** (recomendado, anti-abuso/custo): no painel do projeto → **Security → WAF → Rate limiting rules**, criar regra para o path `/api/anfitri-ia` com limite de ~15 req/min por IP. O plano Free do Workers inclui 100k req/dia; os assets estáticos não contam (só o endpoint do chat invoca o Worker).

5. **Implantar** — aguardar build verde.
5. URL: `https://hostlogic-site.<subdomínio-workers>.workers.dev` ou o host indicado no painel.

> Se no futuro o painel oferecer **Pages** com campo "Build output directory" = `dist`, também funciona sem `wrangler deploy`.

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
- **Anfitri-IA (demonstração):** na home (`/#anfitri-ia`) e em `/demo`, faça uma pergunta ao widget. Resposta esperada dentro de alguns segundos. Sem `GEMINI_API_KEY` no ambiente, o widget mostra "Demonstração indisponível no momento" (503) — não é erro, é a guarda de falta de chave.

## Passo F — UptimeRobot (opcional, Fase 5)

Monitor HTTP: `https://hostlogic.com.br` (intervalo 5 min).

## Rollback

Se algo falhar: repor `@`/`www` para `th.hostlogic.com.br` no DNS (volta ao estado anterior).
