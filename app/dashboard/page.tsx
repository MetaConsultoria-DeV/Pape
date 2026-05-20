'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, BarChart2, Star, Target, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DashboardData {
  total_projetos: number;
  media_satisfacao: number;
  metodologias: Record<string, number>;
  status_cronograma: Record<string, number>;
}

const COLORS = ['#2AD8FF', '#0067FF', '#22C0FF', '#F5A623', '#1FBF6A'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/dashboard/pape`)
      .then(res => setData(res.data))
      .catch(err => console.error('Erro ao carregar dados do dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="meta-bg min-h-screen flex items-center justify-center">
        <Image src="/logos/symbol.svg" alt="Meta Consultoria" width={80} height={80} className="animate-pulse opacity-80" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="meta-bg min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <Image src="/mascots/skull.png" alt="Erro" width={150} height={150} />
        <div className="text-meta-danger font-bold text-2xl h4">Erro ao carregar os dados.</div>
        <p className="text-meta-navy-50 text-sm max-w-md">Não conseguimos nos conectar à API na VPS. Verifique se o servidor está rodando.</p>
        <Link href="/" className="btn btn-primary mt-4">← Voltar para o Início</Link>
      </div>
    );
  }

  const metodologiasData = Object.entries(data.metodologias).map(([name, value]) => ({ name, value }));
  const cronogramaData = Object.entries(data.status_cronograma).map(([name, value]) => ({ name, value }));

  return (
    <div className="meta-bg min-h-screen pb-20">
      
      {/* HEADER PADRÃO DA META */}
      <header className="meta-header">
        <div className="meta-header-inner">
          <div className="meta-header-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src="/logos/wordmark-light.png" alt="Meta Consultoria" style={{ height: '36px' }} />
            </div>
            <Link href="/" className="meta-header-action">
              <ArrowLeft size={18} className="mr-2" />
              Voltar ao Formulário
            </Link>
          </div>
          
          <h1 className="h1" style={{ color: 'white', fontSize: 56, marginBottom: 12, letterSpacing: '-0.03em' }}>
            Dashboard PAPE
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.92)', maxWidth: 560, lineHeight: 1.5, fontWeight: 500 }}>
            Visão geral e resultados em tempo real dos projetos acompanhados.
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (Flutuando sobre o header) */}
      <main className="max-w-6xl mx-auto px-6" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        
        {/* CARDS DE DESTAQUE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="meta-card p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-meta-navy-50 font-bold uppercase text-sm tracking-wider">
              <ClipboardList size={22} className="text-meta-blue" />
              Projetos Avaliados
            </div>
            <div className="text-6xl font-black text-meta-navy tracking-tighter text-gradient">
              {data.total_projetos}
            </div>
          </div>

          <div className="meta-card p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-meta-navy-50 font-bold uppercase text-sm tracking-wider">
              <Star size={22} className="text-warning" fill="currentColor" />
              Satisfação Média
            </div>
            <div className="text-6xl font-black text-meta-navy tracking-tighter flex items-baseline gap-2">
              {data.media_satisfacao} <span className="text-2xl text-meta-navy-30 font-medium">/ 5</span>
            </div>
          </div>

          {/* MASCOTE CARD */}
          <div className="meta-card p-6 flex flex-col items-center justify-center text-center bg-meta-navy relative overflow-hidden" style={{ borderTop: '4px solid var(--meta-blue-light)' }}>
            <Image src="/patterns/network-bottom.png" alt="" fill className="object-cover opacity-20 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <Image src="/mascots/rocket.png" alt="Rocket" width={100} height={100} className="mb-2 drop-shadow-2xl hover:scale-110 transition-transform" />
              <h3 className="text-meta-white font-bold text-lg">Projetos Decolando</h3>
              <p className="text-meta-blue-light text-sm mt-1">Estatísticas atualizadas</p>
            </div>
          </div>

        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="meta-card p-8">
            <h3 className="h4 text-meta-navy mb-6 flex items-center gap-3">
              <Target size={24} className="text-meta-blue" />
              Modelos de Gerenciamento
            </h3>
            
            {metodologiasData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-meta-navy-50">Aguardando novos dados...</div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metodologiasData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {metodologiasData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--meta-navy-10)', boxShadow: 'var(--shadow-md)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="meta-card p-8">
            <h3 className="h4 text-meta-navy mb-6 flex items-center gap-3">
              <BarChart2 size={24} className="text-meta-blue" />
              Status do Cronograma
            </h3>
            
            {cronogramaData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-meta-navy-50">Aguardando novos dados...</div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cronogramaData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{fontSize: 13, fill: 'var(--meta-navy-50)', fontWeight: 500}} 
                      interval={0} 
                      angle={-20} 
                      textAnchor="end"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'var(--meta-navy-50)', fontWeight: 500}}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0, 103, 255, 0.05)'}} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--meta-navy-10)', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Bar dataKey="value" fill="url(#colorBar)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--meta-blue-light)" stopOpacity={1}/>
                        <stop offset="100%" stopColor="var(--meta-blue)" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
