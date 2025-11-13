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

  /**
   * Cria um novo planejamento de aula
   */
  criar(data: CreatePlanejamentoRequest): Observable<Planejamento> {
    return this.http.post<Planejamento>(this.apiUrl, data);
  }

  /**
   * Lista todos os planejamentos (públicos + meus)
   */
  listar(): Observable<Planejamento[]> {
    return this.http.get<Planejamento[]>(this.apiUrl);
  }

  /**
   * Lista apenas os planejamentos do professor autenticado
   */
  listarMeus(): Observable<Planejamento[]> {
    return this.http.get<Planejamento[]>(`${this.apiUrl}/meus`);
  }

  /**
   * Busca planejamentos com filtros
   */
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

    return this.http.get<Planejamento[]>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Busca um planejamento por ID
   */
  buscarPorId(id: number): Observable<Planejamento> {
    return this.http.get<Planejamento>(`${this.apiUrl}/${id}`);
  }

  /**
   * Atualiza um planejamento existente
   */
  atualizar(id: number, data: UpdatePlanejamentoRequest): Observable<Planejamento> {
    return this.http.put<Planejamento>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Deleta um planejamento
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista apenas planejamentos publicados (para todos os usuários)
   */
  listarPublicados(): Observable<Planejamento[]> {
    let params = new HttpParams().set('status', StatusPlanejamento.PUBLICADO);
    return this.http.get<Planejamento[]>(this.apiUrl, { params });
  }

  /**
   * Lista apenas planejamentos pendentes (para diretores)
   */
  listarPendentes(): Observable<Planejamento[]> {
    let params = new HttpParams().set('status', StatusPlanejamento.PENDENTE);
    return this.http.get<Planejamento[]>(this.apiUrl, { params });
  }

  /**
   * Aprova um planejamento (muda status para PUBLICADO)
   */
  aprovar(id: number): Observable<Planejamento> {
    return this.http.patch<Planejamento>(`${this.apiUrl}/${id}/aprovar`, {});
  }

  /**
   * Reprova um planejamento com motivo opcional
   */
  reprovar(id: number, motivo?: string): Observable<Planejamento> {
    return this.http.patch<Planejamento>(`${this.apiUrl}/${id}/reprovar`, { motivo });
  }
}
