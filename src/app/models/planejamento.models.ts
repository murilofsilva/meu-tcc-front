export enum StatusPlanejamento {
  PENDENTE = 'PENDENTE',
  PUBLICADO = 'PUBLICADO',
  REPROVADO = 'REPROVADO',
  AGUARDANDO_AJUSTES = 'AGUARDANDO_AJUSTES'
}

export enum CompetenciaComputacao {
  PENSAMENTO_COMPUTACIONAL = 'PENSAMENTO_COMPUTACIONAL',
  CULTURA_DIGITAL = 'CULTURA_DIGITAL',
  MUNDO_DIGITAL = 'MUNDO_DIGITAL'
}

export const COMPETENCIAS_COMPUTACAO_LABELS: Record<CompetenciaComputacao, string> = {
  [CompetenciaComputacao.PENSAMENTO_COMPUTACIONAL]: 'Pensamento Computacional',
  [CompetenciaComputacao.CULTURA_DIGITAL]: 'Cultura Digital',
  [CompetenciaComputacao.MUNDO_DIGITAL]: 'Mundo Digital'
};

export interface UsuarioResumo {
  id: number;
  nome: string;
  email: string;
}

export interface PlanejamentoResumo {
  id: number;
  titulo: string;
}

export interface AreaConhecimentoResumo {
  id: number;
  nome: string;
}

export interface AreaConhecimento {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface CreateAreaConhecimentoRequest {
  nome: string;
  ativo?: boolean;
}

export interface UpdateAreaConhecimentoRequest {
  nome?: string;
  ativo?: boolean;
}

export interface Planejamento {
  id: number;
  author: UsuarioResumo;
  titulo: string;
  codigo: string | null;
  areaConhecimento: AreaConhecimentoResumo | null;
  area: string;
  descricao: string;
  status: StatusPlanejamento;
  versao: number;
  publico: boolean;
  mobilizaCompetenciasComputacao: boolean;
  competenciasComputacao: string[];
  utilizaRecursosAcessibilidade: boolean;
  descricaoRecursosAcessibilidade: string | null;
  criadoEm: string;
}

export interface CreatePlanejamentoRequest {
  titulo: string;
  areaConhecimentoId: number;
  descricao: string;
  publico: boolean;
  mobilizaCompetenciasComputacao: boolean;
  competenciasComputacao: string[];
  utilizaRecursosAcessibilidade: boolean;
  descricaoRecursosAcessibilidade?: string | null;
}

export interface UpdatePlanejamentoRequest extends CreatePlanejamentoRequest {}

export interface PlanejamentoFiltros {
  palavraChave?: string;
  area?: string;
  authorId?: number;
  status?: StatusPlanejamento;
  somenteComCompetenciasComputacao?: boolean;
  somenteComRecursosAcessibilidade?: boolean;
}
