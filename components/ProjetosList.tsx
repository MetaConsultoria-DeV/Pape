'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  nome: string;
  numero_contrato: string | null;
  gerente: string | null;
  status: 'ativo' | 'finalizado' | 'pausado';
}

interface ProjetosListProps {
  initialProjects: Project[];
}

export default function ProjetosList({ initialProjects }: ProjetosListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on query
  const filteredProjects = initialProjects.filter((project) => {
    const query = searchQuery.toLowerCase();
    const nomeMatches = project.nome.toLowerCase().includes(query);
    const contratoMatches = project.numero_contrato?.toLowerCase().includes(query) ?? false;
    const gerenteMatches = project.gerente?.toLowerCase().includes(query) ?? false;
    return nomeMatches || contratoMatches || gerenteMatches;
  });

  // Helper for status badge styling and labels
  const getStatusBadge = (status: 'ativo' | 'finalizado' | 'pausado') => {
    switch (status) {
      case 'ativo':
        return {
          label: 'Ativo',
          bg: 'rgba(31, 191, 106, 0.1)',
          color: 'var(--meta-success)',
          dot: 'var(--meta-success)',
        };
      case 'finalizado':
        return {
          label: 'Finalizado',
          bg: 'rgba(0, 103, 255, 0.1)',
          color: 'var(--meta-blue)',
          dot: 'var(--meta-blue)',
        };
      case 'pausado':
        return {
          label: 'Pausado',
          bg: 'rgba(245, 166, 35, 0.15)',
          color: 'var(--meta-warning)',
          dot: 'var(--meta-warning)',
        };
      default:
        return {
          label: 'Ativo',
          bg: 'rgba(31, 191, 106, 0.1)',
          color: 'var(--meta-success)',
          dot: 'var(--meta-success)',
        };
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Search Bar Section */}
      <div 
        className="meta-card"
        style={{
          padding: '24px',
          marginBottom: '32px',
          marginTop: '-32px',
          zIndex: 5,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {/* Search Icon SVG */}
          <div
            style={{
              position: 'absolute',
              left: '20px',
              color: 'var(--meta-navy-30)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            className="meta-input"
            placeholder="Pesquise por nome do projeto, número do contrato ou gerente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '56px' }}
          />
        </div>
        {searchQuery && (
          <div style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontWeight: '600' }}>
            Resultados encontrados: <strong>{filteredProjects.length}</strong>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredProjects.map((project) => {
            const statusConfig = getStatusBadge(project.status);
            return (
              <div
                key={project.id}
                className="meta-card meta-fade-in"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'between',
                  minHeight: '260px',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
              >
                {/* Upper info */}
                <div style={{ flex: 1 }}>
                  {/* Status Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color,
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: statusConfig.dot,
                        display: 'inline-block',
                      }}
                    />
                    {statusConfig.label}
                  </div>

                  {/* Project Name */}
                  <h3
                    className="h3"
                    style={{
                      color: 'var(--meta-navy)',
                      fontSize: '20px',
                      fontWeight: '800',
                      marginBottom: '16px',
                      lineHeight: '1.3',
                    }}
                  >
                    {project.nome}
                  </h3>

                  {/* Details block */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {/* Contract Code */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          color: 'var(--meta-blue)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontWeight: '600' }}>
                        Contrato:{' '}
                        <strong style={{ color: 'var(--meta-navy)' }}>
                          {project.numero_contrato || 'Sem contrato'}
                        </strong>
                      </span>
                    </div>

                    {/* Manager */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          color: 'var(--meta-blue)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontWeight: '600' }}>
                        Gerente:{' '}
                        <strong style={{ color: 'var(--meta-navy)' }}>
                          {project.gerente || 'Sem gerente'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Button */}
                <Link
                  href={`/projetos/${project.id}`}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    textAlign: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Ver detalhes
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: '4px' }}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          className="meta-card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              opacity: '0.8',
            }}
          >
            🔍
          </div>
          <h3 className="h3" style={{ marginBottom: '10px' }}>
            Nenhum projeto encontrado
          </h3>
          <p style={{ color: 'var(--meta-navy-50)', maxWidth: '400px', fontSize: '15px', fontWeight: '500' }}>
            Não encontramos projetos que correspondam à sua busca. Tente buscar com termos diferentes.
          </p>
        </div>
      )}
    </div>
  );
}
