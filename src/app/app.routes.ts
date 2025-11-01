import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cadastro-professor',
    loadComponent: () => import('./pages/cadastro-professor/cadastro-professor.component').then(m => m.CadastroProfessorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'salas',
    loadComponent: () => import('./pages/salas/salas').then(m => m.Salas),
    canActivate: [authGuard]
  },
  {
    path: 'agendamentos',
    loadComponent: () => import('./pages/agendamentos/agendamentos.component').then(m => m.AgendamentosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'aprovacoes',
    loadComponent: () => import('./pages/aprovacoes/aprovacoes.component').then(m => m.AprovacoesComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];
