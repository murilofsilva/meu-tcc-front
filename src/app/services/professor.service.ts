import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegisterProfessorRequest, Usuario } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/professores`;

  /**
   * Cadastra um novo professor
   */
  cadastrar(data: RegisterProfessorRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data);
  }

  /**
   * Lista todos os professores
   */
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /**
   * Busca um professor por ID
   */
  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * Ativa ou desativa um professor
   */
  alterarStatus(id: number, status: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/status`, { status });
  }
}
