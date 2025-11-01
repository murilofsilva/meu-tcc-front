export enum PerfilUsuario {
  ADMIN = 'ADMIN',
  DIRETOR = 'DIRETOR',
  PROFESSOR = 'PROFESSOR'
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  status: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

export interface RegisterProfessorRequest {
  nome: string;
  email: string;
  senha: string;
}
