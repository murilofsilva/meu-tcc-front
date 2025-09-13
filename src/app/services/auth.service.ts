import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  role: 'Professor' | 'Coordenador de Inovação';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  
  user = this.userSignal.asReadonly();
  
  constructor(private router: Router) {}
  
  login(role: User['role']): void {
    this.userSignal.set({ role });
    this.router.navigate(['/dashboard']);
  }
  
  logout(): void {
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }
}