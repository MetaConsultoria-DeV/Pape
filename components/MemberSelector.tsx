'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MembrosPorCoordenacao, Membro } from '@/lib/types';

interface MemberSelectorProps {
  membrosPorCoordenacao: MembrosPorCoordenacao[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}

export default function MemberSelector({
  membrosPorCoordenacao,
  selectedIds = [],
  onChange,
  error,
}: MemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Flatten members with group info for easier lookup/filtering
  const allMembers = useMemo(() => {
    const list: (Membro & { coordenacaoNome: string; coordenacaoSigla: string; coordenacaoId: number })[] = [];
    membrosPorCoordenacao.forEach((grupo) => {
      grupo.membros.forEach((membro) => {
        list.push({
          ...membro,
          coordenacaoId: grupo.coordenacao_id,
          coordenacaoNome: grupo.coordenacao_nome,
          coordenacaoSigla: grupo.coordenacao_sigla,
        });
      });
    });
    return list;
  }, [membrosPorCoordenacao]);

  // Map of member ID to member details for O(1) lookups
  const memberMap = useMemo(() => {
    const map = new Map<number, typeof allMembers[0]>();
    allMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [allMembers]);

  // Filtered members grouped by coordination
  const filteredGrupos = useMemo(() => {
    if (!searchTerm.trim()) return membrosPorCoordenacao;

    const term = searchTerm.toLowerCase();
    return membrosPorCoordenacao
      .map((grupo) => {
        const matchingMembros = grupo.membros.filter(
          (m) =>
            m.nome.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term)
        );
        return {
          ...grupo,
          membros: matchingMembros,
        };
      })
      .filter((grupo) => grupo.membros.length > 0);
  }, [membrosPorCoordenacao, searchTerm]);

  const handleSelect = (id: number) => {
    let nextIds: number[];
    if (selectedIds.includes(id)) {
      nextIds = selectedIds.filter((x) => x !== id);
    } else {
      nextIds = [...selectedIds, id];
    }
    onChange(nextIds);
    // Keep focus on input for typing/searching
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIds = selectedIds.filter((x) => x !== id);
    onChange(nextIds);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selected Chips */}
      {selectedIds.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {selectedIds.map((id) => {
            const m = memberMap.get(id);
            if (!m) return null;
            return (
              <div
                key={id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  background: 'rgba(0, 103, 255, 0.08)',
                  border: '1px solid rgba(0, 103, 255, 0.2)',
                  color: 'var(--meta-blue, #0067FF)',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <span>
                  {m.nome} <span style={{ opacity: 0.6, fontSize: 11 }}>({m.coordenacaoSigla})</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(id, e)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--meta-blue, #0067FF)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: 12,
                    lineHeight: 1,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 103, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input container with Search and Toggle icon */}
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => {
            setIsOpen(true);
            if (inputRef.current) inputRef.current.focus();
          }}
          className="meta-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'text',
            padding: '12px 16px',
            borderColor: isOpen ? 'var(--meta-blue)' : error ? 'var(--meta-danger)' : undefined,
            backgroundColor: '#FAFBFC',
            boxShadow: isOpen ? '0 0 0 4px rgba(0, 103, 255, 0.12)' : undefined,
          }}
        >
          <span style={{ marginRight: 10, opacity: 0.4, fontSize: 16 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedIds.length === 0 ? "Buscar consultor..." : "Adicionar mais consultores..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              flex: 1,
              width: '100%',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--meta-navy)',
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: 10,
              color: 'var(--meta-navy-50)',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </button>
        </div>

        {/* Floating Dropdown */}
        {isOpen && (
          <div
            className="meta-fade-in"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              maxHeight: 340,
              overflowY: 'auto',
              backgroundColor: 'var(--meta-white, #FFFFFF)',
              borderRadius: 'var(--radius-md, 12px)',
              boxShadow: 'var(--shadow-lg, 0 12px 32px rgba(19, 25, 54, 0.14))',
              border: '1px solid var(--meta-navy-10, #E5E8F2)',
              zIndex: 50,
              padding: '8px 0',
            }}
          >
            {filteredGrupos.length === 0 ? (
              <div style={{ padding: '16px 20px', color: 'var(--meta-navy-50)', fontSize: 14, textAlign: 'center' }}>
                Nenhum consultor encontrado para "{searchTerm}"
              </div>
            ) : (
              filteredGrupos.map((grupo) => (
                <div key={grupo.coordenacao_id}>
                  {/* Group Header */}
                  <div
                    style={{
                      padding: '8px 20px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--meta-blue, #0067FF)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      backgroundColor: 'rgba(244, 247, 255, 0.5)',
                      borderTop: grupo !== filteredGrupos[0] ? '1px solid var(--meta-navy-10)' : 'none',
                      marginTop: grupo !== filteredGrupos[0] ? 4 : 0,
                    }}
                  >
                    {grupo.coordenacao_nome} ({grupo.coordenacao_sigla})
                  </div>

                  {/* Group Members */}
                  <div style={{ padding: '4px 0' }}>
                    {grupo.membros.map((m) => {
                      const isSelected = selectedIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelect(m.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(0, 103, 255, 0.04)' : 'transparent',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected
                              ? 'rgba(0, 103, 255, 0.08)'
                              : '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected
                              ? 'rgba(0, 103, 255, 0.04)'
                              : 'transparent';
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{
                              width: 16,
                              height: 16,
                              accentColor: 'var(--meta-blue)',
                              cursor: 'pointer',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected ? 'var(--meta-blue)' : 'var(--meta-navy)',
                              }}
                            >
                              {m.nome}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--meta-navy-50)',
                                marginTop: 2,
                              }}
                            >
                              {m.email}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--meta-danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}
