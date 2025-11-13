export enum StatusPlanejamento {
  PENDENTE = 'PENDENTE',
  PUBLICADO = 'PUBLICADO',
  REPROVADO = 'REPROVADO',
  AGUARDANDO_AJUSTES = 'AGUARDANDO_AJUSTES'
}

export interface UsuarioResumo {
  id: number;
  nome: string;
  email: string;
}

export interface PlanejamentoResumo {
  id: number;
  titulo: string;
}

export interface Planejamento {
  id: number;
  author: UsuarioResumo;
  titulo: string;
  area: string;
  descricao: string;
  status: StatusPlanejamento;
  versao: number;
  publico: boolean;
  criadoEm: string;
}

export interface CreatePlanejamentoRequest {
  titulo: string;
  area: string;
  descricao: string;
  publico: boolean;
}

export interface UpdatePlanejamentoRequest {
  titulo: string;
  area: string;
  descricao: string;
  publico: boolean;
}

export interface PlanejamentoFiltros {
  palavraChave?: string;
  area?: string;
  authorId?: number;
  status?: StatusPlanejamento;
}
