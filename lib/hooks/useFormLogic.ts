import { useWatch } from 'react-hook-form';
import { Control } from 'react-hook-form';
import { PapeFormInputs } from '../schema';

export function useFormLogic(control: Control<PapeFormInputs>) {
  const primeira_resposta = useWatch({
    control,
    name: 'primeira_resposta',
  });

  const possui_orientador = useWatch({
    control,
    name: 'possui_orientador',
  });

  const modelo_gerenciamento = useWatch({
    control,
    name: 'modelo_gerenciamento',
  });

  const houve_impedimentos = useWatch({
    control,
    name: 'houve_impedimentos',
  });

  const status_cronograma = useWatch({
    control,
    name: 'status_cronograma',
  });

  // Lógica condicional do branching
  const showProcedimentosIniciais = primeira_resposta === 'Sim';
  const showOrientador = true; // sempre mostra
  const showOrientadorDetalhes = possui_orientador === 'Sim';
  const isModeloAgil = modelo_gerenciamento === 'Ágil';
  const isModeloTradHibrido =
    modelo_gerenciamento === 'Tradicional' ||
    modelo_gerenciamento === 'Híbrido';
  const showImpedimentos = houve_impedimentos === 'Sim';
  const showMotivosAtraso =
    status_cronograma === 'Com risco de atraso' ||
    status_cronograma === 'Atrasado';

  return {
    showProcedimentosIniciais,
    showOrientador,
    showOrientadorDetalhes,
    isModeloAgil,
    isModeloTradHibrido,
    showImpedimentos,
    showMotivosAtraso,
  };
}
