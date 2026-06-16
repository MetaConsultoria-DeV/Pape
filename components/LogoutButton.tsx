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
      // Mesmo se a chamada falhar, mandamos o usuário para o login.
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
