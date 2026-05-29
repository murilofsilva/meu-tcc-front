import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AreaConhecimento,
  CreateAreaConhecimentoRequest,
  UpdateAreaConhecimentoRequest
} from '../models/planejamento.models';

@Injectable({ providedIn: 'root' })
export class AreaConhecimentoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/areas-conhecimento`;

  listar(somenteAtivas = true): Observable<AreaConhecimento[]> {
    const params = new HttpParams().set('somenteAtivas', String(somenteAtivas));
    return this.http.get<AreaConhecimento[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<AreaConhecimento> {
    return this.http.get<AreaConhecimento>(`${this.apiUrl}/${id}`);
  }

  criar(data: CreateAreaConhecimentoRequest): Observable<AreaConhecimento> {
    return this.http.post<AreaConhecimento>(this.apiUrl, data);
  }

  atualizar(id: number, data: UpdateAreaConhecimentoRequest): Observable<AreaConhecimento> {
    return this.http.put<AreaConhecimento>(`${this.apiUrl}/${id}`, data);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
