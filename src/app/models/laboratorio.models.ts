export interface Laboratorio {
  id: number;
  nome: string;
  capacidade: number;
  qtdEquipamentos: number;
  status: boolean;
}

export interface CreateLaboratorioRequest {
  nome: string;
  capacidade: number;
  qtdEquipamentos: number;
}

export interface UpdateLaboratorioRequest {
  nome?: string;
  capacidade?: number;
  qtdEquipamentos?: number;
}
