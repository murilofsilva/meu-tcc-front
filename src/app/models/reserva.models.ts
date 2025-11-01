export enum StatusReserva {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  CANCELADO = 'CANCELADO',
  AGUARDANDO_AJUSTES = 'AGUARDANDO_AJUSTES'
}

export interface LaboratorioResumo {
  id: number;
  nome: string;
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

export interface Reserva {
  id: number;
  laboratorio: LaboratorioResumo;
  professor: UsuarioResumo;
  inicio: string; // ISO 8601 date string
  fim: string; // ISO 8601 date string
  titulo: string;
  turma: string | null;
  descricao: string | null;
  planejamento: PlanejamentoResumo | null;
  status: StatusReserva;
  motivoStatus: string | null;
  criadoEm: string; // ISO 8601 date string
}

export interface CreateReservaRequest {
  laboratorioId: number;
  inicio: string; // ISO 8601 date string
  fim: string; // ISO 8601 date string
  titulo: string;
  turma?: string;
  descricao?: string;
  planejamentoId?: number;
}

export interface UpdateReservaRequest {
  inicio: string; // ISO 8601 date string
  fim: string; // ISO 8601 date string
  titulo: string;
  turma?: string;
  descricao?: string;
}

export interface AlterarStatusReservaRequest {
  status: StatusReserva;
  motivo?: string;
}
