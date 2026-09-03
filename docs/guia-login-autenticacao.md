# Guia: Login de acesso (portável para outro app Next.js)

Este guia ensina a replicar **exatamente** o login do PAPE em outro app Next.js
(App Router). Ele protege o site inteiro com uma **credencial única compartilhada**
(usuário + senha vindos de variáveis de ambiente), usando uma sessão **stateless**
em cookie assinado (JWT HS256).

> **Filosofia:** o **núcleo** (seções 4–6) é copiável **igual**, sem nenhuma
> dependência de design. O **visual** (seções 7–9) usa o design system Meta; a
> seção 10 mostra o que adaptar se o outro app tiver outro visual.

---

## 1. O que você vai ter no final

- Toda rota exige login; sem sessão válida → redireciona para `/login`.
- `/api/*` também protegido (responde `401 JSON`), exceto as rotas de auth.
- Tela `/login` bonita, com usuário + senha e botão "mostrar senha".
- Botão "Sair" no header.
- Segurança: cookie `HttpOnly`/`Secure`/`SameSite`, comparação em tempo constante,
  rate limit por IP, atraso anti-timing, proteção anti open-redirect e **fail-closed**
  (sem env configurada, ninguém entra).

---

## 2. Pré-requisitos

- **Next.js (App Router)**. Este guia assume **Next 16+**, onde o antigo
  `middleware.ts` se chama **`proxy.ts`** (função `proxy`) e roda no **runtime
  Node.js por padrão**.
  - **Next 15 ou anterior:** use `middleware.ts` com `export function middleware(...)`
    no lugar de `proxy.ts`/`proxy` (o conteúdo é idêntico). Em Next 14, `cookies()`
    é síncrono (remova os `await cookies()`).
- **TypeScript** com o alias `@/*` apontando para a raiz do projeto. No `tsconfig.json`:
  ```json
  { "compilerOptions": { "paths": { "@/*": ["./*"] } } }
  ```
  Se o app não usa esse alias, troque os imports `@/lib/...` por caminhos relativos.

---

## 3. Instalar a dependência

Apenas uma:

```bash
npm install jose
```

`jose` é o padrão de fato para JWT/JWS em JS, auditado e compatível tanto com o
runtime Node quanto com o Edge.

---

## 4. Variáveis de ambiente

Adicione ao `.env.local` (valores reais — **nunca** committe este arquivo) e ao
`.env.local.example` (placeholders, esse pode ir pro git):

```bash
# Credenciais de acesso ao site (login único compartilhado)
AUTH_USERNAME=meta
AUTH_PASSWORD=defina_uma_senha_forte

# Segredo para ASSINAR o cookie de sessão (JWT). NÃO é a senha de login.
# Gere com:  openssl rand -base64 32
#       ou:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=troque_por_um_segredo_forte_de_32_bytes

# Duração da sessão em horas (opcional, padrão 12)
AUTH_SESSION_HOURS=12
```

Garanta que o `.gitignore` ignora os env locais:

```gitignore
.env*
```

(o `.env.local.example`, se já estiver versionado, continua versionado).

---

## 5. Estrutura de arquivos

```
proxy.ts                            # gate de acesso (raiz do projeto)
lib/
  auth.ts                           # sessão (jose) — importado pelo proxy
  login-guard.ts                    # credenciais + rate limit (node:crypto)
app/
  api/auth/
    login/route.ts                  # POST login
    logout/route.ts                 # POST logout
  login/
    page.tsx                        # tela /login (Server Component)
    LoginForm.tsx                   # formulário (Client Component)
components/
  LogoutButton.tsx                  # botão "Sair"
```

---

## 6. Núcleo — copie igual

### 6.1 `lib/auth.ts`

```ts
import { SignJWT, jwtVerify } from 'jose';

/**
 * Núcleo de sessão do login.
 *
 * Mantido livre de `node:crypto` de propósito: este módulo é importado pelo
 * `proxy.ts` (o gate de acesso). Assim o grafo do proxy depende apenas de `jose`,
 * que é seguro tanto no runtime Node quanto no Edge.
 */

export const SESSION_COOKIE = 'meta_session';

const DEFAULT_SESSION_HOURS = 12;

/** Deriva a chave de assinatura a partir de AUTH_SECRET. `null` = fail-closed. */
function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

/** Duração da sessão em segundos (AUTH_SESSION_HOURS, padrão 12h). */
export function sessionMaxAgeSeconds(): number {
  const raw = Number(process.env.AUTH_SESSION_HOURS);
  const hours = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_HOURS;
  return Math.floor(hours * 3600);
}

/** Emite um JWT HS256 assinado para a sessão. `null` se AUTH_SECRET ausente. */
export async function createSession(subject: string): Promise<string | null> {
  const key = getSecretKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(subject)
    .setIssuedAt(now)
    .setExpirationTime(now + sessionMaxAgeSeconds())
    .sign(key);
}

/** Valida o token da sessão. `false` em qualquer erro/expiração/segredo ausente. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = getSecretKey();
  if (!key) return false;
  try {
    await jwtVerify(token, key, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

/** Opções padrão do cookie. `secure` só em produção (permite http://localhost). */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Garante que o redirecionamento pós-login é um caminho relativo seguro.
 * Bloqueia URLs absolutas, protocol-relative (`//`) e truques com `\` — anti open-redirect.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== 'string') return '/';
  if (!next.startsWith('/')) return '/';
  if (next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}
```

> **Dica:** mude `SESSION_COOKIE` para um nome próprio do app (ex.: `app_session`)
> se for rodar dois apps no mesmo domínio, para os cookies não colidirem.

### 6.2 `lib/login-guard.ts`

```ts
import { timingSafeEqual } from 'node:crypto';

/**
 * Verificação de credenciais + rate limit do login.
 *
 * Usa `node:crypto`, por isso fica separado de `lib/auth.ts` (que é importado
 * pelo proxy). Só o Route Handler de login (`/api/auth/login`) importa este módulo.
 */

/** Comparação em tempo constante que não vaza o comprimento da string. */
function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA); // mantém o tempo aproximadamente constante
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Valida usuário/senha contra AUTH_USERNAME/AUTH_PASSWORD. `false` se env ausente. */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  // Avalia ambos sempre (sem short-circuit) para não vazar qual campo falhou.
  const okUser = constantTimeEqual(username, expectedUser);
  const okPass = constantTimeEqual(password, expectedPass);
  return okUser && okPass;
}

// ---------------------------------------------------------------------------
// Rate limit (em memória, por instância — best-effort; ok para single-instance).
// ---------------------------------------------------------------------------

type Attempt = { fails: number; firstAt: number; lockedUntil: number };

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

const attempts = new Map<string, Attempt>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (now - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip);
  }
  return { allowed: true };
}

export function registerFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { fails: 1, firstAt: now, lockedUntil: 0 });
    return;
  }
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.lockedUntil = now + LOCK_MS;
  }
}

export function resetRateLimit(ip: string): void {
  attempts.delete(ip);
}

/** Extrai o IP do cliente respeitando proxies reversos. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
```

> **Nota sobre o rate limit:** é em memória, por instância do servidor. Suficiente
> para um app rodando em uma única instância (ex.: uma VPS). Em ambiente serverless
> ou com várias réplicas, troque o `Map` por Redis/Upstash.

### 6.3 `proxy.ts` (na raiz do projeto)

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

/**
 * Gate de acesso do site (no Next 16 o antigo `middleware` chama-se `proxy`).
 * Toda rota não pública exige uma sessão válida; caso contrário:
 *  - rotas `/api/*` → 401 JSON;
 *  - páginas → redirect para `/login?next=<rota>`.
 */

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  // Roda em tudo, menos estáticos e as pastas de imagem públicas (para a tela
  // de login conseguir carregar o logo). A allowlist acima trata /login e /api/auth.
  // AJUSTE as pastas conforme o conteúdo de `public/` do seu app.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logos|mascots|meta|patterns).*)'],
};
```

> **Atenção ao `matcher`:** ele exclui as pastas de `public/` que guardam imagens
> usadas na tela de login (aqui: `logos`, `mascots`, `meta`, `patterns`). Liste as
> pastas do **seu** `public/` que a `/login` precisa carregar, senão o logo não
> aparece. Em Next 15/anterior, é o mesmo `config` dentro de `middleware.ts`.

### 6.4 `app/api/auth/login/route.ts`

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  createSession,
  cookieOptions,
  sessionMaxAgeSeconds,
  safeNextPath,
} from '@/lib/auth';
import {
  verifyCredentials,
  checkRateLimit,
  registerFailure,
  resetRateLimit,
  clientIp,
} from '@/lib/login-guard';

/** Login está configurado apenas se as três variáveis essenciais existem. */
function authConfigured(): boolean {
  return Boolean(
    process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD && process.env.AUTH_SECRET,
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  // Fail-closed: sem credenciais/segredo no servidor, ninguém entra.
  if (!authConfigured()) {
    return NextResponse.json(
      { detail: 'Login não configurado no servidor. Defina AUTH_USERNAME, AUTH_PASSWORD e AUTH_SECRET.' },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { detail: 'Muitas tentativas. Tente novamente mais tarde.', retryAfter: rate.retryAfter },
      { status: 429 },
    );
  }

  let body: { username?: unknown; password?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const next = typeof body.next === 'string' ? body.next : '/';

  if (!verifyCredentials(username, password)) {
    registerFailure(ip);
    await sleep(400); // mitiga brute-force e reduz sinal de timing
    return NextResponse.json({ detail: 'Usuário ou senha inválidos.' }, { status: 401 });
  }

  resetRateLimit(ip);

  const token = await createSession(username);
  if (!token) {
    return NextResponse.json({ detail: 'Falha ao criar a sessão.' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, redirect: safeNextPath(next) });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions(sessionMaxAgeSeconds()));
  return res;
}
```

### 6.5 `app/api/auth/logout/route.ts`

```ts
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, cookieOptions } from '@/lib/auth';

/** Encerra a sessão limpando o cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', cookieOptions(0));
  return res;
}
```

---

## 7. Telas e UI

### 7.1 `app/login/page.tsx` (Server Component)

```tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession, safeNextPath } from '@/lib/auth';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesso restrito.',
};

// A sessão depende de cookies → renderização dinâmica.
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>; // Next 16: searchParams é Promise
}) {
  const { next } = await searchParams;
  const target = safeNextPath(next);

  // Já autenticado? Não faz sentido mostrar o login.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    redirect(target);
  }

  return (
    <div className="meta-bg login-shell">
      <LoginForm next={target} />
    </div>
  );
}
```

### 7.2 `app/login/LoginForm.tsx` (Client Component)

> **Adapte:** o caminho do logo (`/logos/lockup-light.png`), os textos e as classes
> visuais (`meta-card`, `meta-input`, `btn-primary`, `eyebrow`, etc. — veja a seção 8/10).

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Lock, LogIn, ShieldCheck } from 'lucide-react';

type LoginFormProps = { next: string };

export default function LoginForm({ next }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password, next }),
      });

      if (res.ok) {
        const data = (await res.json()) as { redirect?: string };
        // Navegação completa para o proxy reavaliar a sessão com o cookie presente.
        window.location.assign(data.redirect || '/');
        return;
      }

      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as { retryAfter?: number };
        const minutes = data.retryAfter ? Math.ceil(data.retryAfter / 60) : null;
        setError(
          minutes
            ? `Muitas tentativas. Tente novamente em ~${minutes} min.`
            : 'Muitas tentativas. Tente novamente mais tarde.',
        );
      } else if (res.status === 503) {
        setError('Login indisponível: o servidor ainda não foi configurado.');
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch {
      setError('Não foi possível conectar. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="meta-card meta-fade-in login-card" onSubmit={handleSubmit} noValidate>
      <div className="login-brand">
        <Image
          src="/logos/lockup-light.png"
          alt="Logo"
          width={168}
          height={56}
          priority
          style={{ width: 'auto', height: 52 }}
        />
      </div>

      <span className="eyebrow text-meta-blue login-eyebrow">
        <ShieldCheck size={14} aria-hidden="true" />
        Acesso restrito
      </span>
      <h1 className="h3 login-title">Entrar</h1>
      <p className="login-subtitle">
        Esta área é restrita. Informe suas credenciais para continuar.
      </p>

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <div className="login-field">
        <label htmlFor="username">Usuário</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="meta-input"
          placeholder="Seu usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          autoFocus
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="password">Senha</label>
        <div className="login-password-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="meta-input"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={18} className="meta-spin" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn size={18} aria-hidden="true" />
            Entrar
          </>
        )}
      </button>

      <p className="login-foot">
        <Lock size={13} aria-hidden="true" />
        Conexão protegida — suas credenciais não são compartilhadas.
      </p>
    </form>
  );
}
```

> Os ícones são do **`lucide-react`**. Se o app não tiver, instale com
> `npm install lucide-react` ou troque por SVGs/ícones próprios.

### 7.3 `components/LogoutButton.tsx` (Client Component)

```tsx
'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';

/** Botão de logout no estilo das ações do header. Limpa a sessão e volta ao /login. */
export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Mesmo se falhar, mandamos o usuário para o login.
    } finally {
      window.location.assign('/login');
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="meta-header-action"
      style={{
        backgroundColor: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <LogOut size={16} aria-hidden="true" />
      Sair
    </button>
  );
}
```

---

## 8. CSS da tela de login

Cole no `globals.css` do app. Estas classes (`.login-*`) são autocontidas, mas
usam **tokens** do design system (variáveis `--meta-*`, `--radius-*`). Se o app não
tiver esses tokens, veja a seção 10 para os valores.

```css
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
.login-card {
  width: 100%;
  max-width: 440px;
  padding: 44px 40px 36px;
  display: flex;
  flex-direction: column;
}
.login-brand { display: flex; justify-content: center; margin-bottom: 28px; }
.login-eyebrow { display: inline-flex; align-items: center; gap: 6px; align-self: center; }
.login-title { margin: 10px 0 8px; text-align: center; }
.login-subtitle {
  margin: 0 auto 26px;
  max-width: 340px;
  text-align: center;
  color: var(--meta-navy-50);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}
.login-field { margin-bottom: 18px; }
.login-field label {
  display: block;
  margin-bottom: 8px;
  color: var(--meta-navy);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.login-password-wrap { position: relative; }
.login-password-wrap .meta-input { padding-right: 52px; }
.login-password-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--meta-navy-50);
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}
.login-password-toggle:hover { color: var(--meta-blue); background: rgba(0, 103, 255, 0.06); }
.login-error {
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(229, 72, 77, 0.25);
  background: rgba(229, 72, 77, 0.08);
  color: var(--meta-danger);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}
.login-submit { width: 100%; margin-top: 6px; }
.login-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 22px;
  color: var(--meta-navy-30);
  font-size: 12px;
  font-weight: 600;
}
@media (max-width: 480px) {
  .login-card { padding: 36px 24px 28px; }
}
```

---

## 9. Integrar o botão "Sair" no header

Renderize `<LogoutButton />` dentro do header do app (onde já ficam os outros links).
Como o `LogoutButton` é Client Component, ele pode ser usado tanto em Server quanto
em Client Components. Exemplo:

```tsx
import LogoutButton from '@/components/LogoutButton';
// ...
<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
  {/* outros links do header */}
  <LogoutButton />
</div>
```

---

## 10. Adaptando para o design de OUTRO app

A tela depende destas classes/tokens do design system Meta. Se o app de destino
**não** tiver o design Meta, faça uma das opções:

**(A) Manter o visual Meta idêntico** — copie estes tokens e classes para o `globals.css`:

```css
:root {
  --meta-blue-light:  #2AD8FF;
  --meta-blue:        #0067FF;
  --meta-gradient:    linear-gradient(135deg, #2AD8FF 0%, #0067FF 100%);
  --meta-gradient-h:  linear-gradient(90deg, #2AD8FF 0%, #0067FF 100%);
  --meta-gradient-v:  linear-gradient(180deg, #2AD8FF 0%, #0067FF 100%);
  --meta-navy:    #131936;
  --meta-paper:   #F4F7FF;
  --meta-white:   #FFFFFF;
  --meta-navy-50: #6B7299;
  --meta-navy-30: #B5BACC;
  --meta-navy-10: #E5E8F2;
  --meta-danger:  #E5484D;
  --shadow-lg:   0 12px 32px rgba(19, 25, 54, 0.14);
  --shadow-blue: 0 8px 24px rgba(0, 103, 255, 0.25);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px;
}

.meta-bg {
  background:
    radial-gradient(circle at 0% 0%, rgba(42,216,255,0.08) 0%, transparent 35%),
    radial-gradient(circle at 100% 100%, rgba(0,103,255,0.08) 0%, transparent 35%),
    var(--meta-paper);
  min-height: 100vh;
}
.eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
.text-meta-blue { color: var(--meta-blue); }
.h3 { font-size: 28px; font-weight: 700; line-height: 1.3; }

.meta-card {
  background: var(--meta-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(229, 232, 242, 0.6);
  position: relative;
  overflow: hidden;
}
.meta-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: var(--meta-gradient-h);
}

.meta-input {
  width: 100%; padding: 16px 20px; border-radius: var(--radius-md);
  border: 2px solid var(--meta-navy-10); background-color: #FAFBFC;
  color: var(--meta-navy); font-size: 16px; font-weight: 500; outline: none;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
}
.meta-input::placeholder { color: var(--meta-navy-30); font-weight: 400; }
.meta-input:focus {
  border-color: var(--meta-blue); background-color: var(--meta-white);
  box-shadow: 0 0 0 4px rgba(0,103,255,0.12);
}

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  padding: 16px 32px; border-radius: var(--radius-md); font-weight: 700; font-size: 15px;
  border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); text-decoration: none;
}
.btn-primary { background: var(--meta-gradient); color: var(--meta-white); box-shadow: var(--shadow-blue); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,103,255,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
.meta-fade-in { animation: fadeInUp 0.4s cubic-bezier(0.4,0,0.2,1); }
@keyframes spin { to { transform: rotate(360deg);} }
.meta-spin { animation: spin 1s linear infinite; }

.meta-header-action {
  min-height: 44px; display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 18px; border-radius: var(--radius-md); font-size: 14px; font-weight: 800;
  text-decoration: none;
}
```
E coloque um logo em `public/logos/` apontado pelo `LoginForm`.

**(B) Usar o design do app de destino** — troque no `LoginForm.tsx`/CSS:
- `meta-card` → o "card/painel" do app;
- `meta-input` → o input do app;
- `btn btn-primary` → o botão primário do app;
- `meta-bg` → o fundo de página do app;
- `eyebrow`, `h3`, `text-meta-blue` → tipografia/cores do app;
- `meta-header-action` (no `LogoutButton`) → estilo de ação do header do app;
- o `src` do `<Image>` → logo do app.
O **núcleo** (seção 6) continua **idêntico**.

---

## 11. Verificação (rodando `npm run dev`)

Com as variáveis no `.env.local`, suba o app e rode:

```bash
# 1) /login deve responder 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login

# 2) rota protegida sem sessão → 307 para /login
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/

# 3) API sem sessão → 401 JSON
curl -s http://localhost:3000/api/qualquer

# 4) senha errada → 401
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "content-type: application/json" -d '{"username":"meta","password":"errada"}'

# 5) login correto → 200 + Set-Cookie + redirect; salva o cookie
curl -s -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "content-type: application/json" -d '{"username":"meta","password":"SUA_SENHA"}' | grep -i "set-cookie\|HTTP"

# 6) com o cookie, a rota protegida deixa passar (não redireciona)
curl -s -o /dev/null -w "%{http_code}\n" -b cookies.txt http://localhost:3000/

# 7) anti open-redirect: next externo deve virar "/"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "content-type: application/json" \
  -d '{"username":"meta","password":"SUA_SENHA","next":"https://evil.com"}'
```

Esperado: (1) 200, (2) 307 → `/login?next=%2F`, (3) `{"detail":"Não autenticado."}`,
(4) 401, (5) `Set-Cookie: <cookie>=...; HttpOnly; SameSite=lax`, (6) 200,
(7) `"redirect":"/"`. Apague o `cookies.txt` depois (não committe).

---

## 12. Checklist de produção

- [ ] `AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_SECRET` definidos **no servidor**
      (não no repo). **Sem eles o site fica fail-closed e ninguém entra.**
- [ ] `AUTH_SECRET` forte e **diferente** por ambiente (`openssl rand -base64 32`).
- [ ] App servido por **HTTPS** (o cookie é `Secure` em produção; em HTTP puro o
      login entra em loop).
- [ ] Reiniciar o app após setar as variáveis (pm2/systemd/docker).
- [ ] Se houver **autodeploy a partir da branch principal**, configurar as variáveis
      **antes** de o deploy subir.
- [ ] `.env.local` (ou equivalente com segredos) está no `.gitignore`.

---

## 13. Como funciona (resumo)

```
Deslogado → qualquer rota
   └─ proxy → redirect /login?next=<rota>
        └─ usuário envia credenciais → POST /api/auth/login
             ├─ inválidas → 401 (+atraso, +contador) → erro na tela
             └─ válidas → set-cookie (JWT assinado) → redirect para next
                  └─ proxy valida o cookie → libera a rota
Sair → POST /api/auth/logout → limpa cookie → /login
```

**Decisões de segurança:**
- Cookie `HttpOnly` (JS não lê) + `Secure` (prod) + `SameSite=Lax` + expiração no token.
- Sessão **stateless**: o servidor não guarda sessões; valida o JWT pela assinatura.
- `AUTH_SECRET` ≠ senha de login (separa "quem entra" de "como assina a sessão").
- Comparação de credenciais em **tempo constante** (não vaza por timing).
- Mensagem de erro **genérica** (não revela se o usuário existe).
- **Fail-closed**: faltando env, bloqueia tudo em vez de liberar.
- `next` **validado** como caminho relativo (anti open-redirect).

---

## 14. Gotchas do Next.js 16

- `middleware.ts` foi renomeado para **`proxy.ts`** (função `proxy`). Em versões
  anteriores, use `middleware.ts`/`middleware` com o mesmo corpo.
- `cookies()` é **assíncrono** → `const store = await cookies();`. Set/delete de
  cookie só em Route Handler ou Server Function (por isso login/logout são rotas).
- `searchParams` e `params` em páginas são **Promises** → `await searchParams`.
- O `proxy` **não** intercepta Server Functions de caminhos excluídos no `matcher`.
  Se usar Server Actions sensíveis, valide a sessão **dentro** delas também.
- O `matcher` precisa ser **constante** (analisado em build); não use variáveis.
```
