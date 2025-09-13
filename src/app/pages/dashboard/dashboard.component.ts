import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface DashboardAction {
  title: string;
  icon: string;
  route?: string;
  action?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user = this.authService.user;
  
  get actions(): DashboardAction[] {
    const baseActions = [
      { title: 'Novo Agendamento', icon: 'plus', route: '/agendamento' },
      { title: 'Consultar Repositório', icon: 'search', route: '/repositorio' }
    ];
    
    if (this.user()?.role === 'Coordenador de Inovação') {
      return [
        ...baseActions,
        { title: 'Aprovar Solicitações', icon: 'check', route: '/aprovacoes' },
        { title: 'Gerar Relatórios', icon: 'document', action: 'reports' }
      ];
    }
    
    return baseActions;
  }
  
  onActionClick(action: DashboardAction): void {
    if (action.route) {
      this.router.navigate([action.route]);
    } else if (action.action === 'reports') {
      alert('Funcionalidade de Relatórios em desenvolvimento.');
    }
  }
}