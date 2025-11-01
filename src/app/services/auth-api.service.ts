import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from '../models/auth.models';

/**
 * Serviço responsável por chamadas HTTP relacionadas à autenticação
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Faz login no sistema
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Registra um novo usuário (público)
   */
  register(data: RegisterRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, data);
  }

  /**
   * Obtém os dados do usuário autenticado
   */
  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }
}
