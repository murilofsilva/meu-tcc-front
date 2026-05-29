import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Laboratorio,
  CreateLaboratorioRequest,
  UpdateLaboratorioRequest,
  Disponibilidade,
  CreateDisponibilidadeRequest,
  Indisponibilidade,
  CreateIndisponibilidadeRequest
} from '../models/laboratorio.models';

@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/laboratorios`;

  cadastrar(data: CreateLaboratorioRequest): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(this.apiUrl, data);
  }

  listar(status?: boolean): Observable<Laboratorio[]> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Laboratorio[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, data: UpdateLaboratorioRequest): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.apiUrl}/${id}`, data);
  }

  alterarStatus(id: number, status: boolean): Observable<Laboratorio> {
    return this.http.patch<Laboratorio>(`${this.apiUrl}/${id}/status`, { status });
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarDisponibilidades(laboratorioId: number): Observable<Disponibilidade[]> {
    return this.http.get<Disponibilidade[]>(`${this.apiUrl}/${laboratorioId}/disponibilidades`);
  }

  substituirDisponibilidades(
    laboratorioId: number,
    janelas: CreateDisponibilidadeRequest[]
  ): Observable<Disponibilidade[]> {
    return this.http.put<Disponibilidade[]>(
      `${this.apiUrl}/${laboratorioId}/disponibilidades`,
      janelas
    );
  }

  listarIndisponibilidades(laboratorioId: number): Observable<Indisponibilidade[]> {
    return this.http.get<Indisponibilidade[]>(`${this.apiUrl}/${laboratorioId}/indisponibilidades`);
  }

  criarIndisponibilidade(
    laboratorioId: number,
    data: CreateIndisponibilidadeRequest
  ): Observable<Indisponibilidade> {
    return this.http.post<Indisponibilidade>(
      `${this.apiUrl}/${laboratorioId}/indisponibilidades`,
      data
    );
  }

  removerIndisponibilidade(laboratorioId: number, id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${laboratorioId}/indisponibilidades/${id}`
    );
  }
}
