import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario, LoginRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private userSignal = signal<Usuario | null>(null);

  user = this.userSignal.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  /**
   * Carrega o usuário do localStorage se houver token válido
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as Usuario;
        this.userSignal.set(user);
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  /**
   * Limpa os dados de autenticação do storage
   */
  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  /**
   * Salva os dados de autenticação no storage
   */
  private saveToStorage(token: string, user: Usuario): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Faz login do usuário com email e senha
   *
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Promise que resolve em sucesso ou rejeita com mensagem de erro
   */
  async login(email: string, password: string): Promise<void> {
    const credentials: LoginRequest = { email, senha: password };

    return new Promise((resolve, reject) => {
      this.apiService.login(credentials)
        .pipe(
          tap(response => {
            this.saveToStorage(response.token, response.usuario);
            this.userSignal.set(response.usuario);
            this.router.navigate(['/dashboard']);
          }),
          catchError(error => {
            const errorMessage = error?.error?.message
              || error?.error?.mensagem
              || 'Erro ao fazer login. Verifique suas credenciais.';
            return throwError(() => errorMessage);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (err) => reject(err)
        });
    });
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    this.clearStorage();
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.userSignal() !== null && !!localStorage.getItem('auth_token');
  }

  /**
   * Retorna o token de autenticação
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}