import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Reserva,
  CreateReservaRequest,
  UpdateReservaRequest,
  AlterarStatusReservaRequest,
  StatusReserva
} from '../models/reserva.models';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservas`;

  /**
   * Cria uma nova reserva
   */
  criar(data: CreateReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, data);
  }

  /**
   * Lista todas as reservas
   * PROFESSOR vê apenas as suas
   * DIRETOR e ADMIN veem todas
   */
  listar(status?: StatusReserva): Observable<Reserva[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Reserva[]>(this.apiUrl, { params });
  }

  /**
   * Lista reservas pendentes (para aprovação)
   * Apenas DIRETOR e ADMIN
   */
  listarPendentes(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/pendentes`);
  }

  /**
   * Busca uma reserva por ID
   */
  buscarPorId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca reservas de um laboratório em um período
   */
  buscarPorLaboratorioEPeriodo(
    laboratorioId: number,
    inicio: string,
    fim: string
  ): Observable<Reserva[]> {
    let params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);
    return this.http.get<Reserva[]>(`${this.apiUrl}/laboratorio/${laboratorioId}`, { params });
  }

  /**
   * Atualiza uma reserva
   */
  atualizar(id: number, data: UpdateReservaRequest): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Altera o status de uma reserva (aprovar/reprovar/solicitar ajustes)
   */
  alterarStatus(id: number, data: AlterarStatusReservaRequest): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/status`, data);
  }

  /**
   * Cancela uma reserva
   */
  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista reservas futuras do professor autenticado
   * Usado para vincular planejamentos
   */
  listarFuturas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/futuras`);
  }

  /**
   * Vincula ou substitui um planejamento em uma reserva existente
   */
  vincularPlanejamento(reservaId: number, planejamentoId: number): Observable<Reserva> {
    return this.http.patch<Reserva>(
      `${this.apiUrl}/${reservaId}/planejamento`,
      { planejamentoId }
    );
  }
}
