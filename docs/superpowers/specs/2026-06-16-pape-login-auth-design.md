# Design — Login de acesso ao PAPE (credencial única, site inteiro)

**Data:** 2026-06-16
**App:** `pape/` (Next.js 16.2.5, App Router, React 19, TypeScript, Tailwind v4)
**Objetivo:** Proteger o site inteiro atrás de uma tela de login bonita (alinhada ao design Meta), com credenciais definidas em variáveis de ambiente. Sessão stateless, segura e bem estruturada.

---

## 1. Decisões fechadas

- **Modelo:** credencial **única compartilhada** (um `AUTH_USERNAME` + `AUTH_PASSWORD`).
- **Escopo:** **site inteiro** protegido (formulário PAPE `/`, `/dashboard`, `/projetos`, `/novo-projeto` e detalhes).
- **Sessão:** JWT assinado (HS256) via **`jose`**, guardado em cookie `HttpOnly`.
- **Gate:** arquivo `proxy.ts` (o antigo `middleware.ts` — renomeado no Next 16).

---

## 2. Restrições do Next.js 16 (verificadas na doc empacotada)

1. `middleware.ts` foi **renomeado para `proxy.ts`**; a função exportada chama-se `proxy`. Roda no **runtime Node.js por padrão** (logo `node:crypto` e `jose` funcionam nele).
2. `cookies()` de `next/headers` é **assíncrono** → `const store = await cookies()`. Escrita de cookie só em Route Handler / Server Function.
3. `searchParams` e `params` em páginas são **Promises** → precisam de `await`.
4. Proxy **não** intercepta Server Functions de caminhos excluídos no `matcher`; por isso a autorização real também é garantida nos Route Handlers, e as escritas continuam exigindo a senha de confirmação (`x-confirmation-password`) já existente. Defesa em profundidade.
5. Padrão do repositório: tudo via **Route Handlers** (não há Server Actions). O login segue esse padrão.

---

## 3. Variáveis de ambiente (novas)

Adicionar em `pape/.env.local` (valores reais) e `pape/.env.local.example` (placeholders + comentários):

```
# Credenciais de acesso ao site (login único compartilhado)
AUTH_USERNAME=meta
AUTH_PASSWORD=defina_uma_senha_forte

# Segredo para assinar a sessão (JWT HS256). NÃO é a senha de login.
# Gere com:  openssl rand -base64 32
AUTH_SECRET=troque_por_um_segredo_forte_de_32+_bytes

# Duração da sessão em horas (opcional, padrão 12)
AUTH_SESSION_HOURS=12
```

- `.env.local` já é ignorado pelo git (confirmar no `.gitignore`).
- **Fail-closed:** se `AUTH_USERNAME`/`AUTH_PASSWORD`/`AUTH_SECRET` faltarem, o login responde `503` e o proxy bloqueia tudo (ninguém entra por engano).

---

## 4. Arquitetura e componentes

### 4.1 `lib/auth.ts` — núcleo de sessão (edge-safe, só `jose`)
Importado pelo `proxy.ts`; **não** importa `node:crypto` para manter o grafo do proxy enxuto.
- `SESSION_COOKIE = 'meta_session'`.
- `getSecretKey(): Uint8Array | null` — deriva o segredo de `AUTH_SECRET`; `null` se ausente (fail-closed).
- `createSession(subject: string): Promise<string>` — `new SignJWT({ ... })` HS256, `iat`, `exp = agora + AUTH_SESSION_HOURS`.
- `verifySession(token: string | undefined): Promise<boolean>` — `jwtVerify`; `false` em qualquer erro/expiração/segredo ausente.
- `cookieOptions(maxAgeSeconds)` — `{ httpOnly: true, secure: NODE_ENV==='production', sameSite: 'lax', path: '/', maxAge }`.
- `sessionMaxAgeSeconds()` — lê `AUTH_SESSION_HOURS` (padrão 12) → segundos.
- `safeNextPath(next: string | null): string` — só aceita caminho relativo que começa com `/` e **não** com `//` nem `/\` (anti open-redirect / protocol-relative); senão retorna `'/'`.

### 4.2 `lib/login-guard.ts` — verificação de credenciais + rate limit (server-only, Node)
Separado do `lib/auth.ts` porque usa `node:crypto`; só o Route Handler de login importa.
- `verifyCredentials(username, password): boolean` — compara `AUTH_USERNAME`/`AUTH_PASSWORD` em **tempo constante** (`crypto.timingSafeEqual`, com normalização de comprimento para não vazar tamanho). `false` se env ausente.
- Rate limit em memória (`Map<ip, { fails, firstAt, lockedUntil }>`):
  - `checkRateLimit(ip): { allowed: boolean; retryAfter?: number }`
  - `registerFailure(ip)` / `resetRateLimit(ip)`
  - Política: **5 falhas / 15 min → bloqueia 15 min**. Best-effort (por instância; ok para VPS single-instance).
- `clientIp(req): string` — primeiro IP de `x-forwarded-for`, senão `'unknown'`.

### 4.3 `proxy.ts` (raiz do `pape/`) — gate de acesso
```
export async function proxy(request) {
  if (path em ALLOWLIST) return NextResponse.next();        // /login, /api/auth/*
  const ok = await verifySession(request.cookies.get('meta_session')?.value);
  if (ok) return NextResponse.next();
  if (path.startsWith('/api/')) return Response.json({ detail: 'Não autenticado.' }, { status: 401 });
  const url = request.nextUrl.clone(); url.pathname = '/login';
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|logos|meta).*)'] };
```
- **Allowlist interna:** `/login`, `/api/auth/login`, `/api/auth/logout` (evita loop e mantém o login acessível deslogado).
- Matcher exclui estáticos e as pastas de imagem públicas (`/logos`, `/meta`) para a tela de login carregar o wordmark. (Confirmar nomes reais em `public/` na implementação.)
- Sem segredo configurado → `verifySession` retorna `false` → todos vão para `/login` (que então responde 503). Fail-closed.

### 4.4 `app/api/auth/login/route.ts` — `POST`
1. Se env de auth ausente → `503`.
2. `clientIp` → `checkRateLimit`; se bloqueado → `429 { detail, retryAfter }`.
3. Body JSON `{ username, password, next? }`.
4. `verifyCredentials`:
   - **Falha:** `registerFailure`, pequeno atraso (~400 ms), `401 { detail: 'Usuário ou senha inválidos.' }` (mensagem genérica).
   - **Sucesso:** `resetRateLimit`, `createSession(username)`, resposta `200 { ok: true, redirect: safeNextPath(next) }` com `response.cookies.set(SESSION_COOKIE, token, cookieOptions(maxAge))`.

### 4.5 `app/api/auth/logout/route.ts` — `POST`
- Limpa o cookie (`set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 })`), retorna `200 { ok: true }`.

### 4.6 `app/login/page.tsx` — Server Component
- `await searchParams` para ler `next`.
- Se já autenticado (`await cookies()` + `verifySession`) → `redirect(safeNextPath(next))`.
- Renderiza `meta-bg` centralizado + `<LoginForm next={next} />`.

### 4.7 `app/login/LoginForm.tsx` — Client Component (`'use client'`)
- Estado: `username`, `password`, `showPassword`, `error`, `loading`.
- Submit → `fetch('/api/auth/login', { method:'POST', body: JSON })`.
  - `ok` → `window.location.assign(data.redirect)` (navegação completa para o proxy reavaliar com o cookie já presente).
  - `401` → mensagem genérica; `429` → "Muitas tentativas, tente novamente em X min"; rede/500 → mensagem amigável.
- Visual (classes existentes): `meta-card` (com a barra de gradiente no topo), wordmark `/logos/wordmark-...`, título **"Acesso restrito"** + subtítulo, campo usuário (`meta-input`), campo senha (`meta-input`) com toggle olho (`lucide-react` `Eye`/`EyeOff`, já é dependência), alerta de erro, botão `btn btn-primary` com spinner (`meta-spin`) no loading. Animação `meta-fade-in`.

### 4.8 `components/LogoutButton.tsx` — Client Component
- Botão estilo `meta-header-action`, ícone de logout, label **"Sair"**. `onClick` → `POST /api/auth/logout` → `window.location.assign('/login')`.
- Renderizado no `PapeHeader` (form/projetos/novo-projeto) e no chrome do dashboard (`components/dashboard/Chrome.tsx` — confirmar e integrar na implementação).

### 4.9 `package.json`
- Adicionar dependência **`jose`** (`npm install jose`).

---

## 5. Fluxo (resumo)

```
Deslogado → qualquer rota
   └─ proxy → redirect /login?next=<rota>
        └─ usuário envia credenciais → POST /api/auth/login
             ├─ inválidas → 401 (+atraso, +contador) → erro na tela
             └─ válidas → set-cookie meta_session (JWT) → redirect p/ next
                  └─ proxy valida cookie → libera a rota
Sair → POST /api/auth/logout → limpa cookie → /login
```

---

## 6. Segurança — checklist

- [x] Cookie `HttpOnly` + `Secure` (prod) + `SameSite=Lax` + `path=/` + `maxAge`.
- [x] JWT HS256 assinado com `AUTH_SECRET` (segredo ≠ senha); expiração no token.
- [x] Comparação de credenciais em **tempo constante**.
- [x] Mensagem de erro genérica (não revela se o usuário existe).
- [x] Rate limit por IP + atraso em falha (mitiga brute-force).
- [x] **Fail-closed** sem env configurada.
- [x] Proteção anti open-redirect no parâmetro `next`.
- [x] `/api/*` também protegido pelo proxy (401 JSON), exceto `/api/auth/*`.
- [x] Senha de confirmação das escritas mantida (defesa em profundidade).
- [x] Sem segredos commitados (`.env.local` ignorado; `.env.local.example` só com placeholders).

---

## 7. Verificação (manual — não há test runner no `pape/`)

Rodando `npm run dev` em `pape/` com as env definidas:
1. Acessar `/` deslogado → redireciona para `/login?next=%2F`.
2. Senha errada → erro genérico; após 5 tentativas → bloqueio (429).
3. Credenciais corretas → entra e cai em `/`; navegar para `/dashboard`, `/projetos` sem novo login.
4. `GET /api/projetos` direto deslogado (outra aba/sem cookie) → `401 JSON`.
5. **Sair** → cookie limpo → volta a `/login`; rotas protegidas exigem login de novo.
6. `/login?next=https://evil.com` → após login vai para `/`, não para o domínio externo.
7. Recarregar página logada → continua logado (cookie válido). Após `AUTH_SESSION_HOURS` → exige login.

---

## 8. Fora de escopo (YAGNI)

- Múltiplos usuários / papéis / "lembrar-me".
- Recuperação de senha, 2FA, OAuth.
- Persistência de rate limit em banco/Redis.
- Senha em hash no env (texto plano em env é consistente com o padrão atual do projeto: `ADMIN_API_TOKEN`/`CONFIRMATION_PASSWORD`).
```
