import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanejamentoService } from '../../services/planejamento.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';
import { Planejamento, StatusPlanejamento } from '../../models/planejamento.models';
import { PerfilUsuario } from '../../models/auth.models';

@Component({
  selector: 'app-aprovacoes-planejamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprovacoes-planejamentos.component.html',
  styleUrls: ['./aprovacoes-planejamentos.component.css']
})
export class AprovacoesPlanejamentosComponent implements OnInit {
  private planejamentoService = inject(PlanejamentoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  planejamentosPendentes: Planejamento[] = [];
  user = this.authService.user;

  // Modal de rejeição
  isRejectionModalOpen = false;
  selectedPlanejamentoId: number | null = null;
  motivoRejeicao = '';

  // Modal de detalhes
  isDetailsModalOpen = false;
  selectedPlanejamento: Planejamento | null = null;

  ngOnInit(): void {
    // Verificar se o usuário é diretor
    if (this.user()?.perfil !== PerfilUsuario.DIRETOR) {
      this.notificationService.show('Acesso negado. Apenas diretores podem acessar esta página.', 'error');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.carregarPlanejamentosPendentes();
  }

  carregarPlanejamentosPendentes(): void {
    this.planejamentoService.listarPendentes().subscribe({
      next: (planejamentos) => {
        this.planejamentosPendentes = planejamentos;
      },
      error: (error) => {
        this.notificationService.show('Erro ao carregar planejamentos pendentes', 'error');
        console.error('Erro ao carregar planejamentos pendentes:', error);
      }
    });
  }

  abrirModalDetalhes(planejamento: Planejamento): void {
    this.selectedPlanejamento = planejamento;
    this.isDetailsModalOpen = true;
  }

  fecharModalDetalhes(): void {
    this.isDetailsModalOpen = false;
    this.selectedPlanejamento = null;
  }

  abrirModalRejeicao(id: number): void {
    this.selectedPlanejamentoId = id;
    this.motivoRejeicao = '';
    this.isRejectionModalOpen = true;
    this.fecharModalDetalhes(); // Fecha o modal de detalhes se estiver aberto
  }

  fecharModalRejeicao(): void {
    this.isRejectionModalOpen = false;
    this.selectedPlanejamentoId = null;
    this.motivoRejeicao = '';
  }

  aprovarPlanejamento(id: number): void {
    this.planejamentoService.aprovar(id).subscribe({
      next: () => {
        this.notificationService.show('Planejamento aprovado com sucesso!', 'success');
        this.planejamentosPendentes = this.planejamentosPendentes.filter(p => p.id !== id);
        this.fecharModalDetalhes();
      },
      error: (error) => {
        this.notificationService.show('Erro ao aprovar planejamento', 'error');
        console.error('Erro ao aprovar planejamento:', error);
      }
    });
  }

  confirmarRejeicao(): void {
    if (!this.selectedPlanejamentoId) return;

    const motivo = this.motivoRejeicao.trim() || 'Planejamento não atende aos requisitos necessários.';

    this.planejamentoService.reprovar(this.selectedPlanejamentoId, motivo).subscribe({
      next: () => {
        this.notificationService.show(`Planejamento reprovado. Motivo: ${motivo}`, 'error');
        this.planejamentosPendentes = this.planejamentosPendentes.filter(
          p => p.id !== this.selectedPlanejamentoId
        );
        this.fecharModalRejeicao();
        this.fecharModalDetalhes();
      },
      error: (error) => {
        this.notificationService.show('Erro ao reprovar planejamento', 'error');
        console.error('Erro ao reprovar planejamento:', error);
      }
    });
  }

  voltarDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
