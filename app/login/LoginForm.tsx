'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Lock, LogIn, ShieldCheck } from 'lucide-react';

type LoginFormProps = {
  next: string;
};

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
        // Navegação completa para o proxy reavaliar a sessão com o cookie já presente.
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
          alt="Meta Consultoria"
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
      <h1 className="h3 login-title">Entrar no PAPE</h1>
      <p className="login-subtitle">
        Esta área é restrita à equipe da Meta. Informe suas credenciais para continuar.
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
