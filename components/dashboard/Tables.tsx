import { EmptyChart, ScoreBadge, StatusBadge } from './Chrome';
import type {
  ClientImpact,
  DashboardProject,
  MethodAttention,
  RiskMatrixRow,
  RiskProject,
} from './types';
import { formatDate } from './utils';

export function ProjectTable({ projects }: { projects: DashboardProject[] }) {
  if (!projects.length) {
    return <EmptyChart message="Aguardando respostas para montar a lista de projetos." />;
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Gerente</th>
            <th>Coordenação</th>
            <th>Status</th>
            <th>Conclusão</th>
            <th>Resposta</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={`${project.id}-${project.data_resposta}`}>
              <td>
                <strong>{project.projeto}</strong>
                <span>{project.modelo_gerenciamento}</span>
              </td>
              <td>{project.gerente}</td>
              <td>{project.coordenacao}</td>
              <td>
                <StatusBadge status={project.status_cronograma} />
              </td>
              <td>{project.pct_conclusao}</td>
              <td>{formatDate(project.data_resposta)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RiskMatrixTable({ rows }: { rows: RiskMatrixRow[] }) {
  if (!rows.length) {
    return <EmptyChart message="Nenhum motivo de risco/atraso registrado por coordenação." />;
  }

  const coordenacoes = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row.coordenacoes))),
  ).slice(0, 5);

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table dashboard-risk-matrix">
        <thead>
          <tr>
            <th>Motivo selecionado</th>
            {coordenacoes.map((coordenacao) => (
              <th key={coordenacao}>{coordenacao}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 7).map((row) => (
            <tr key={row.motivo}>
              <td>
                <strong>{row.motivo}</strong>
              </td>
              {coordenacoes.map((coordenacao) => (
                <td key={coordenacao}>{row.coordenacoes[coordenacao] ?? 0}</td>
              ))}
              <td>
                <strong>{row.total}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RiskProjectsTable({ projects }: { projects: RiskProject[] }) {
  if (!projects.length) {
    return <EmptyChart message="Nenhum projeto em risco ou atrasado no status atual." />;
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table dashboard-risk-projects">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Status</th>
            <th>Coordenação</th>
            <th>Motivos</th>
          </tr>
        </thead>
        <tbody>
          {projects.slice(0, 10).map((project) => (
            <tr key={`${project.projeto}-${project.status}`}>
              <td>
                <strong>{project.projeto}</strong>
              </td>
              <td>
                <StatusBadge status={project.status} />
              </td>
              <td>{project.coordenacao}</td>
              <td>
                <span>{project.motivos.length ? project.motivos.join(', ') : 'Sem motivo informado'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MethodAttentionTable({ items }: { items: MethodAttention[] }) {
  if (!items.length) {
    return <EmptyChart message="Nenhum indicador de método ou escopo com nota crítica." />;
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table dashboard-method-attention">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Indicador</th>
            <th>Modelo</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 10).map((item) => (
            <tr key={`${item.projeto}-${item.indicador}-${item.nota}`}>
              <td>
                <strong>{item.projeto}</strong>
              </td>
              <td>{item.indicador}</td>
              <td>{item.modelo}</td>
              <td>
                <ScoreBadge value={item.nota} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClientImpactTable({ items }: { items: ClientImpact[] }) {
  if (!items.length) {
    return <EmptyChart message="Ainda não há respostas sobre impacto percebido pelo cliente." />;
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table dashboard-client-impact">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Impacto percebido</th>
            <th>Valor percebido</th>
            <th>Orientador</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 10).map((item) => (
            <tr key={`${item.projeto}-${item.impacto_cliente}`}>
              <td>
                <strong>{item.projeto}</strong>
              </td>
              <td>{item.impacto_cliente}</td>
              <td>
                {item.cliente_percebeu_valor ? (
                  <ScoreBadge value={item.cliente_percebeu_valor} />
                ) : (
                  <span>Sem nota</span>
                )}
              </td>
              <td>{item.orientador}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
