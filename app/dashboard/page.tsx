'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, BarChart2, Star, Target, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DashboardData {
  total_projetos: number;
  media_satisfacao: number;
  metodologias: Record<string, number>;
  status_cronograma: Record<string, number>;
}

const COLORS = ['#0067FF', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        <div className="text-meta-blue font-bold text-xl animate-pulse">Carregando painel...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="meta-bg min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-meta-danger font-bold text-lg">Erro ao carregar os dados do PAPE.</div>
        <p className="text-meta-navy-50 text-sm">Verifique se o backend está rodando e com o banco de dados atualizado.</p>
        <Link href="/" className="btn btn-secondary mt-4">← Voltar</Link>
      </div>
    );
  }

  const metodologiasData = Object.entries(data.metodologias).map(([name, value]) => ({ name, value }));
  const cronogramaData = Object.entries(data.status_cronograma).map(([name, value]) => ({ name, value }));

  return (
    <div className="meta-bg min-h-screen p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-6 mb-10">
          <div>
            <h1 className="h2 text-meta-navy mb-2">Dashboard PAPE</h1>
            <p className="text-meta-navy-50 text-lg">Acompanhamento e resultados consolidados dos projetos</p>
          </div>
          <Link href="/" className="btn btn-secondary flex items-center gap-2">
            <ArrowLeft size={18} />
            Voltar ao Formulário
          </Link>
        </header>

        {/* Cards de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="meta-card p-8 flex flex-col gap-4 border-l-4" style={{borderLeftColor: 'var(--meta-blue)'}}>
            <div className="flex items-center gap-3 text-meta-navy-50 font-bold uppercase text-sm tracking-wider">
              <ClipboardList size={22} className="text-meta-blue" />
              Projetos Avaliados
            </div>
            <div className="text-5xl font-black text-meta-navy">{data.total_projetos}</div>
          </div>

          <div className="meta-card p-8 flex flex-col gap-4 border-l-4 border-yellow-400">
            <div className="flex items-center gap-3 text-meta-navy-50 font-bold uppercase text-sm tracking-wider">
              <Star size={22} className="text-yellow-400" fill="currentColor" />
              Satisfação Média
            </div>
            <div className="text-5xl font-black text-meta-navy">
              {data.media_satisfacao} <span className="text-2xl text-meta-navy-50 font-medium">/ 5</span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Metodologias - Gráfico de Pizza */}
          <div className="meta-card p-8">
            <h3 className="text-xl font-bold text-meta-navy mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
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
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {metodologiasData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Cronograma - Gráfico de Barras */}
          <div className="meta-card p-8">
            <h3 className="text-xl font-bold text-meta-navy mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
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
                      tick={{fontSize: 13, fill: 'var(--meta-navy-50)'}} 
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
                      tick={{fill: 'var(--meta-navy-50)'}}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0, 103, 255, 0.05)'}} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="var(--meta-blue)" radius={[6, 6, 0, 0]} maxBarSize={60} />
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
