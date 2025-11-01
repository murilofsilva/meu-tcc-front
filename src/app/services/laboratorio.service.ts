import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Laboratorio, CreateLaboratorioRequest, UpdateLaboratorioRequest } from '../models/laboratorio.models';

@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/laboratorios`;

  /**
   * Cadastra um novo laboratório
   */
  cadastrar(data: CreateLaboratorioRequest): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(this.apiUrl, data);
  }

  /**
   * Lista todos os laboratórios
   * @param status - Filtro opcional por status (ativo/inativo)
   */
  listar(status?: boolean): Observable<Laboratorio[]> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Laboratorio[]>(this.apiUrl, { params });
  }

  /**
   * Busca um laboratório por ID
   */
  buscarPorId(id: number): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.apiUrl}/${id}`);
  }

  /**
   * Atualiza um laboratório
   */
  atualizar(id: number, data: UpdateLaboratorioRequest): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Ativa ou desativa um laboratório
   */
  alterarStatus(id: number, status: boolean): Observable<Laboratorio> {
    return this.http.patch<Laboratorio>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Deleta um laboratório
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
