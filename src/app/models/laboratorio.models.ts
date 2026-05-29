export interface Laboratorio {
  id: number;
  nome: string;
  capacidade: number;
  quantidadeComputadores: number;
  descricao: string | null;
  status: boolean;
}

export interface CreateLaboratorioRequest {
  nome: string;
  capacidade: number;
  quantidadeComputadores: number;
  descricao?: string | null;
}

export interface UpdateLaboratorioRequest {
  nome?: string;
  capacidade?: number;
  quantidadeComputadores?: number;
  descricao?: string | null;
}

export enum DiaSemana {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export const DIAS_SEMANA_ORDEM: DiaSemana[] = [
  DiaSemana.MONDAY,
  DiaSemana.TUESDAY,
  DiaSemana.WEDNESDAY,
  DiaSemana.THURSDAY,
  DiaSemana.FRIDAY,
  DiaSemana.SATURDAY,
  DiaSemana.SUNDAY
];

export const DIAS_SEMANA_LABELS: Record<DiaSemana, string> = {
  [DiaSemana.MONDAY]: 'Segunda-feira',
  [DiaSemana.TUESDAY]: 'Terça-feira',
  [DiaSemana.WEDNESDAY]: 'Quarta-feira',
  [DiaSemana.THURSDAY]: 'Quinta-feira',
  [DiaSemana.FRIDAY]: 'Sexta-feira',
  [DiaSemana.SATURDAY]: 'Sábado',
  [DiaSemana.SUNDAY]: 'Domingo'
};

export interface Disponibilidade {
  id: number;
  laboratorioId: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}

export interface CreateDisponibilidadeRequest {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}

export interface Indisponibilidade {
  id: number;
  laboratorioId: number;
  inicio: string;
  fim: string;
  motivo: string;
}

export interface CreateIndisponibilidadeRequest {
  inicio: string;
  fim: string;
  motivo: string;
}
