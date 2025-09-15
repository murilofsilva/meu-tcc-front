import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  
  user = this.userSignal.asReadonly();
  
  constructor(private router: Router) {}
  
  login(): void {
    this.userSignal.set({ role: 'user' });
    this.router.navigate(['/dashboard']);
  }
  
  logout(): void {
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  // Método temporário para desenvolvimento - alterar papel do usuário
  switchRole(role: string): void {
    const currentUser = this.userSignal();
    if (currentUser) {
      this.userSignal.set({ role });
    }
  }
}