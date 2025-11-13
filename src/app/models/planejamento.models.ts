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
  criadoEm: string;
}

export interface CreatePlanejamentoRequest {
  titulo: string;
  area: string;
  descricao: string;
}

export interface UpdatePlanejamentoRequest {
  titulo: string;
  area: string;
  descricao: string;
}

export interface PlanejamentoFiltros {
  palavraChave?: string;
  area?: string;
  authorId?: number;
  status?: StatusPlanejamento;
}
