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
   | `RESEND_API_KEY` | chave da API Resend (lista de espera e programa piloto) — `wrangler secret put RESEND_API_KEY` |
   | `APP_PILOT_INTAKE_URL` | URL completa `…/api/public/pilot-requests` no app (TH ou PROD) — `wrangler secret put APP_PILOT_INTAKE_URL` |
   | `APP_PILOT_INTAKE_SECRET` | mesmo valor que `SITE_PILOT_INTAKE_SECRET` no Render — `wrangler secret put APP_PILOT_INTAKE_SECRET` |

   > `GEMINI_API_KEY`, `RESEND_API_KEY`, `APP_PILOT_INTAKE_URL` e `APP_PILOT_INTAKE_SECRET` são **secrets**. Nunca commitá-los nem pôr no `wrangler.toml`.
   > Local: `.dev.vars` (já no `.gitignore`) para `wrangler dev`.

4. **Rate Limiting** (recomendado, anti-abuso/custo): no painel do projeto → **Security → WAF → Rate limiting rules**, criar regra para o path `/api/anfitri-ia` com limite de ~15 req/min por IP. O plano Free do Workers inclui 100k req/dia; os assets estáticos não contam (só os endpoints `/api/*` invocam o Worker).

5. **Implantar** — aguardar build verde.
6. URL: `https://hostlogic-site.<subdomínio-workers>.workers.dev` ou o host indicado no painel.

> Se no futuro o painel oferecer **Pages** com campo "Build output directory" = `dist`, também funciona sem `wrangler deploy`.

## Lista de espera (Resend)

O formulário em `/#inscreva-se` chama `POST /api/waitlist`. O Worker envia:

1. E-mail interno para `WAITLIST_TO` (`adm@hostlogic.com.br`) com Reply-To = e-mail do visitante.
2. Confirmação (best-effort) para o visitante, From `noreply@hostlogic.com.br`.

### Caixas `@hostlogic.com.br`

Receber e enviar são coisas diferentes:

| Endereço | Receber (Cloudflare Email Routing) | Enviar (Resend, domínio verified) |
|----------|--------------------------------------|-----------------------------------|
| `adm@hostlogic.com.br` | Sim (já encaminha para o Gmail) | Reply-To das confirmações |
| `noreply@hostlogic.com.br` | Não precisa de caixa (só From) | From do formulário |
| `contato@hostlogic.com.br` | Opcional: nova regra no Routing → mesmo Gmail | Opcional mais tarde |

No Resend **não se criam caixas**. Depois do domínio `hostlogic.com.br` estar com DNS de envio verde (SPF/DKIM/MX em `send.`), qualquer `*@hostlogic.com.br` pode ser From.

Não ligue Receiving no Resend — o `adm@` continua na Cloudflare.

### Secret e teste

```bash
cd hostlogic-site
npx wrangler secret put RESEND_API_KEY
# Local: acrescentar RESEND_API_KEY="re_..." em .dev.vars
```

No Resend: API Keys → Create → permissão **Sending access**. From = `HostLogic <noreply@hostlogic.com.br>` (`WAITLIST_FROM` no `wrangler.toml`).

Teste após deploy: preencher a lista de espera com um e-mail real → deve chegar em `adm@` (Gmail) e uma confirmação no endereço do visitante.

## Programa piloto (Worker → app)

O formulário em `/#programa-piloto` (home e `/planos`) chama `POST /api/pilot-intake` **no mesmo origin**. O browser **não** chama o app. O Worker:

1. Valida o corpo (faixa só `6-10` / `11-20` / `20+`, URL `https` Airbnb, consentimento).
2. `POST` para o app (`APP_PILOT_INTAKE_URL`) com o header `X-HostLogic-Site-Key` = `APP_PILOT_INTAKE_SECRET`.
3. Envia aviso a `adm@hostlogic.com.br` e confirmação ao visitante (Resend). Se o app falhar ou der timeout, o aviso interno vai **mesmo assim**, com a flag **não gravado**.

`consentVersion` = `piloto-site-2026-09`. Sem `APP_PILOT_INTAKE_SECRET` (ou URL inválida) o Worker é **fail-closed**: 503, **não** envia o body a um host arbitrário.

### Secrets (nunca no browser, nunca no `wrangler.toml`)

| Nome | Valor |
|------|--------|
| `APP_PILOT_INTAKE_URL` | URL completa do app, ex. `https://th.hostlogic.com.br/api/public/pilot-requests` (TH) ou `https://app.hostlogic.com.br/api/public/pilot-requests` (PROD) |
| `APP_PILOT_INTAKE_SECRET` | **O mesmo valor** que `SITE_PILOT_INTAKE_SECRET` no Render do app |
| `RESEND_API_KEY` | Já usado na lista de espera |

```bash
cd hostlogic-site
npx wrangler secret put APP_PILOT_INTAKE_URL
npx wrangler secret put APP_PILOT_INTAKE_SECRET
# Local: acrescentar as duas linhas em .dev.vars (já no .gitignore)
```

A oferta pública em `/planos` (15 dias, 4 imóveis, tabela R$39–249) **não muda**. O programa piloto é uma secção à parte.

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

# Lista de espera (Worker + Resend):
curl -s -o /dev/null -w "%{http_code}" -X POST https://hostlogic.com.br/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"x","email":"bad","properties":"1","consent":true}'
# esperado: 400

# Programa piloto (Worker; o browser nunca chama o app):
curl -s -o /dev/null -w "%{http_code}" -X POST https://hostlogic.com.br/api/pilot-intake \
  -H "Content-Type: application/json" \
  -d '{"name":"x","email":"bad","airbnbProfileUrl":"https://example.com","listingsBand":"1","firstPropertyName":"x","consent":true}'
# esperado: 400
```

No browser:

- Home com logo, cards, contato e-mail/telefone.
- **Acessar o sistema** → `https://app.hostlogic.com.br`
- Privacidade/Termos → app `/privacidade` e `/termos`
- **Anfitri-IA (demonstração):** na home (`/#anfitri-ia`) e em `/demo`, faça uma pergunta ao widget. Resposta esperada dentro de alguns segundos. Sem `GEMINI_API_KEY` no ambiente, o widget mostra "Demonstração indisponível no momento" (503) — não é erro, é a guarda de falta de chave.
- **Lista de espera:** em `/#inscreva-se`, «Enviar interesse» deve mostrar «Pedido enviado» (sem copiar mensagem). Sem `RESEND_API_KEY`, o botão mostra indisponível (503).
- **Programa piloto:** em `/#programa-piloto` (home e `/planos`), a pergunta canónica e o formulário (faixa só 6–10 / 11–20 / 20+). Sem `APP_PILOT_INTAKE_SECRET`, o envio devolve 503 (fail-closed). `/planos` continua com 15 dias, 4 imóveis e a tabela R$39–249.

## Passo F — UptimeRobot (opcional, Fase 5)

Monitor HTTP: `https://hostlogic.com.br` (intervalo 5 min).

## Rollback

Se algo falhar: repor `@`/`www` para `th.hostlogic.com.br` no DNS (volta ao estado anterior).
