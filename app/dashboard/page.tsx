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
      <div className="min-h-screen flex flex-col items-center justify-center bg-meta-navy text-meta-paper" style={{ backgroundImage: "url('/patterns/network.png')", backgroundBlendMode: 'soft-light' }}>
        <Image src="/logos/symbol.svg" alt="Meta Consultoria" width={80} height={80} className="animate-pulse mb-6 opacity-80" />
        <div className="text-meta-blue-light font-bold text-xl uppercase tracking-widest">Carregando painel...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-meta-navy text-meta-paper gap-6" style={{ backgroundImage: "url('/patterns/network.png')", backgroundBlendMode: 'soft-light' }}>
        <Image src="/mascots/skull.png" alt="Erro" width={150} height={150} />
        <div className="text-meta-danger font-bold text-2xl">Erro ao carregar os dados.</div>
        <p className="text-meta-navy-30 text-sm">Verifique se o backend está respondendo.</p>
        <Link href="/" className="btn bg-meta-gradient text-white mt-4 border-none hover:opacity-90 shadow-meta-glow">← Voltar</Link>
      </div>
    );
  }

  const metodologiasData = Object.entries(data.metodologias).map(([name, value]) => ({ name, value }));
  const cronogramaData = Object.entries(data.status_cronograma).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen pb-20 relative bg-[#F4F7FF]" style={{ backgroundImage: "url('/patterns/halftone.png')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundBlendMode: 'multiply', opacity: 0.99 }}>
      
      {/* HEADER ESCURO INSTITUCIONAL */}
      <header className="bg-meta-navy text-white shadow-meta-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('/patterns/triangles.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="max-w-7xl mx-auto px-8 py-8 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-6">
            <Image src="/logos/wordmark-dark.png" alt="Meta Consultoria" width={180} height={40} className="object-contain" />
            <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Dashboard <span className="text-meta-blue-light">PAPE</span></h1>
              <p className="text-meta-navy-30 text-sm font-medium tracking-wide uppercase mt-1">Plano de Acompanhamento de Projetos Externos</p>
            </div>
          </div>
          <Link href="/" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm flex items-center gap-2 transition-all">
            <ArrowLeft size={18} />
            Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 mt-12 space-y-10 relative z-10">
        
        {/* CARDS DE KPIS */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* DESTAQUE COM MASCOTE */}
          <div className="lg:w-1/3 rounded-meta-xl overflow-hidden relative shadow-meta-lg text-white" style={{ background: 'var(--meta-gradient)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-30">
              <Image src="/patterns/waves.png" alt="waves" width={200} height={200} className="object-cover" />
            </div>
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="eyebrow text-white/80 mb-2">Visão Geral</div>
              <h2 className="text-3xl font-black leading-tight mb-4">Como estão nossos projetos?</h2>
              <div className="mt-auto self-end pt-4">
                <Image src="/mascots/rocket.png" alt="Rocket Mascot" width={140} height={140} className="drop-shadow-2xl" />
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-meta-xl p-8 shadow-meta-md flex flex-col justify-center border-l-4 border-meta-blue">
              <div className="flex items-center gap-3 text-meta-navy-50 font-bold uppercase text-sm tracking-wider mb-4">
                <ClipboardList size={22} className="text-meta-blue" />
                Projetos Avaliados
              </div>
              <div className="text-6xl font-black text-meta-navy tracking-tighter" style={{ background: 'var(--meta-gradient-h)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {data.total_projetos}
              </div>
            </div>

            <div className="bg-white rounded-meta-xl p-8 shadow-meta-md flex flex-col justify-center border-l-4 border-warning">
              <div className="flex items-center gap-3 text-meta-navy-50 font-bold uppercase text-sm tracking-wider mb-4">
                <Star size={22} className="text-warning" fill="currentColor" />
                Satisfação Média
              </div>
              <div className="text-6xl font-black text-meta-navy tracking-tighter flex items-baseline gap-2">
                {data.media_satisfacao} <span className="text-2xl text-meta-navy-30 font-medium">/ 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-meta-xl p-8 shadow-meta-md">
            <h3 className="text-xl font-bold text-meta-navy mb-8 flex items-center gap-3 border-b border-meta-navy-10 pb-4">
              <Target size={24} className="text-meta-blue" />
              Modelos de Gerenciamento
            </h3>
            
            {metodologiasData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-meta-navy-50">Sem dados suficientes</div>
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
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--meta-lg)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-meta-xl p-8 shadow-meta-md">
            <h3 className="text-xl font-bold text-meta-navy mb-8 flex items-center gap-3 border-b border-meta-navy-10 pb-4">
              <BarChart2 size={24} className="text-meta-blue" />
              Status do Cronograma
            </h3>
            
            {cronogramaData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-meta-navy-50">Sem dados suficientes</div>
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
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--meta-lg)' }}
                    />
                    <Bar dataKey="value" fill="url(#colorUv)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--meta-blue-light)" stopOpacity={1}/>
                        <stop offset="95%" stopColor="var(--meta-blue)" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
