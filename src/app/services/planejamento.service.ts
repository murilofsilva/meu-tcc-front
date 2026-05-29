import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Planejamento,
  CreatePlanejamentoRequest,
  UpdatePlanejamentoRequest,
  StatusPlanejamento,
  PlanejamentoFiltros
} from '../models/planejamento.models';

@Injectable({
  providedIn: 'root'
})
export class PlanejamentoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/planejamentos`;

  criar(data: CreatePlanejamentoRequest): Observable<Planejamento> {
    return this.http.post<Planejamento>(this.apiUrl, data);
  }

  listar(): Observable<Planejamento[]> {
    return this.http.get<Planejamento[]>(this.apiUrl);
  }

  listarMeus(): Observable<Planejamento[]> {
    return this.http.get<Planejamento[]>(`${this.apiUrl}/meus`);
  }

  buscarComFiltros(filtros: PlanejamentoFiltros): Observable<Planejamento[]> {
    let params = new HttpParams();

    if (filtros.palavraChave) {
      params = params.set('palavraChave', filtros.palavraChave);
    }
    if (filtros.area) {
      params = params.set('area', filtros.area);
    }
    if (filtros.authorId) {
      params = params.set('authorId', filtros.authorId.toString());
    }
    if (filtros.status) {
      params = params.set('status', filtros.status);
    }
    if (filtros.somenteComCompetenciasComputacao) {
      params = params.set('somenteComCompetenciasComputacao', 'true');
    }
    if (filtros.somenteComRecursosAcessibilidade) {
      params = params.set('somenteComRecursosAcessibilidade', 'true');
    }

    return this.http.get<Planejamento[]>(`${this.apiUrl}/buscar`, { params });
  }

  buscarPorId(id: number): Observable<Planejamento> {
    return this.http.get<Planejamento>(`${this.apiUrl}/${id}`);
  }

  buscarPorCodigo(codigo: string): Observable<Planejamento> {
    return this.http.get<Planejamento>(`${this.apiUrl}/codigo/${encodeURIComponent(codigo)}`);
  }

  atualizar(id: number, data: UpdatePlanejamentoRequest): Observable<Planejamento> {
    return this.http.put<Planejamento>(`${this.apiUrl}/${id}`, data);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPublicados(): Observable<Planejamento[]> {
    const params = new HttpParams().set('status', StatusPlanejamento.PUBLICADO);
    return this.http.get<Planejamento[]>(this.apiUrl, { params });
  }

  listarPendentes(): Observable<Planejamento[]> {
    const params = new HttpParams().set('status', StatusPlanejamento.PENDENTE);
    return this.http.get<Planejamento[]>(this.apiUrl, { params });
  }

  aprovar(id: number): Observable<Planejamento> {
    return this.http.patch<Planejamento>(`${this.apiUrl}/${id}/aprovar`, {});
  }

  reprovar(id: number, motivo?: string): Observable<Planejamento> {
    return this.http.patch<Planejamento>(`${this.apiUrl}/${id}/reprovar`, { motivo });
  }
}
