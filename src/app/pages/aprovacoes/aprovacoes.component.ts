import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { NotificationService } from '../../core/notification.service';
import { Reserva, AlterarStatusReservaRequest, StatusReserva } from '../../models/reserva.models';

@Component({
  selector: 'app-aprovacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprovacoes.component.html',
  styleUrls: ['./aprovacoes.component.css']
})
export class AprovacoesComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  isLoading = false;
  showModal = false;
  isSubmitting = false;

  // Detalhes da reserva selecionada
  reservaSelecionada: Reserva | null = null;
  acaoSelecionada: 'aprovar' | 'reprovar' | 'ajustes' | null = null;
  motivo: string = '';

  // Filtros
  filtroStatus: string = 'PENDENTE';

  // Status enum para o template
  StatusReserva = StatusReserva;

  ngOnInit(): void {
    this.carregarReservas();
  }

  carregarReservas(): void {
    this.isLoading = true;

    if (this.filtroStatus === 'PENDENTE') {
      this.reservaService.listarPendentes().subscribe({
        next: (reservas) => {
          this.reservas = reservas;
          this.aplicarFiltro();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar reservas:', error);
          this.notificationService.show('Erro ao carregar reservas', 'error');
          this.isLoading = false;
        }
      });
    } else {
      const status = this.filtroStatus === 'TODAS' ? undefined :
                     this.filtroStatus as StatusReserva;

      this.reservaService.listar(status).subscribe({
        next: (reservas) => {
          this.reservas = reservas;
          this.aplicarFiltro();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar reservas:', error);
          this.notificationService.show('Erro ao carregar reservas', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  aplicarFiltro(): void {
    if (this.filtroStatus === 'TODAS') {
      this.reservasFiltradas = this.reservas;
    } else {
      this.reservasFiltradas = this.reservas.filter(r => r.status === this.filtroStatus);
    }
  }

  onFiltroChange(): void {
    this.carregarReservas();
  }

  abrirModalAprovar(reserva: Reserva): void {
    this.reservaSelecionada = reserva;
    this.acaoSelecionada = 'aprovar';
    this.motivo = '';
    this.showModal = true;
  }

  abrirModalReprovar(reserva: Reserva): void {
    this.reservaSelecionada = reserva;
    this.acaoSelecionada = 'reprovar';
    this.motivo = '';
    this.showModal = true;
  }

  abrirModalSolicitarAjustes(reserva: Reserva): void {
    this.reservaSelecionada = reserva;
    this.acaoSelecionada = 'ajustes';
    this.motivo = '';
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
    this.reservaSelecionada = null;
    this.acaoSelecionada = null;
    this.motivo = '';
  }

  confirmarAcao(): void {
    if (!this.reservaSelecionada || !this.acaoSelecionada) {
      return;
    }

    // Validação: motivo obrigatório para reprovar e solicitar ajustes
    if ((this.acaoSelecionada === 'reprovar' || this.acaoSelecionada === 'ajustes') &&
        !this.motivo.trim()) {
      this.notificationService.show('O motivo é obrigatório.', 'error');
      return;
    }

    const request: AlterarStatusReservaRequest = {
      status: this.getNovoStatus(),
      motivo: this.motivo.trim() || undefined
    };

    this.isSubmitting = true;

    this.reservaService.alterarStatus(this.reservaSelecionada.id, request).subscribe({
      next: () => {
        const mensagens = {
          aprovar: 'Reserva aprovada com sucesso!',
          reprovar: 'Reserva reprovada.',
          ajustes: 'Solicitação de ajustes enviada ao professor.'
        };

        this.notificationService.show(mensagens[this.acaoSelecionada!], 'success');
        this.fecharModal();
        this.carregarReservas();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erro ao alterar status:', error);
        const mensagem = error.error?.mensagem || 'Erro ao processar solicitação';
        this.notificationService.show(mensagem, 'error');
        this.isSubmitting = false;
      }
    });
  }

  private getNovoStatus(): StatusReserva {
    switch (this.acaoSelecionada) {
      case 'aprovar':
        return StatusReserva.APROVADO;
      case 'reprovar':
        return StatusReserva.REPROVADO;
      case 'ajustes':
        return StatusReserva.AGUARDANDO_AJUSTES;
      default:
        return StatusReserva.PENDENTE;
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }

  getStatusClass(status: StatusReserva): string {
    switch (status) {
      case StatusReserva.APROVADO:
        return 'bg-green-500';
      case StatusReserva.PENDENTE:
        return 'bg-yellow-500';
      case StatusReserva.REPROVADO:
        return 'bg-red-500';
      case StatusReserva.CANCELADO:
        return 'bg-gray-500';
      case StatusReserva.AGUARDANDO_AJUSTES:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  }

  getStatusLabel(status: StatusReserva): string {
    switch (status) {
      case StatusReserva.APROVADO:
        return 'Aprovado';
      case StatusReserva.PENDENTE:
        return 'Pendente';
      case StatusReserva.REPROVADO:
        return 'Reprovado';
      case StatusReserva.CANCELADO:
        return 'Cancelado';
      case StatusReserva.AGUARDANDO_AJUSTES:
        return 'Aguardando Ajustes';
      default:
        return status;
    }
  }

  getAcaoTitulo(): string {
    switch (this.acaoSelecionada) {
      case 'aprovar':
        return 'Aprovar Reserva';
      case 'reprovar':
        return 'Reprovar Reserva';
      case 'ajustes':
        return 'Solicitar Ajustes';
      default:
        return '';
    }
  }

  getAcaoMensagem(): string {
    switch (this.acaoSelecionada) {
      case 'aprovar':
        return 'Deseja aprovar esta reserva?';
      case 'reprovar':
        return 'Deseja reprovar esta reserva? Informe o motivo:';
      case 'ajustes':
        return 'Deseja solicitar ajustes ao professor? Informe o que deve ser corrigido:';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateString: string): string {
    return `${this.formatDate(dateString)} ${this.formatTime(dateString)}`;
  }

  podeAprovar(reserva: Reserva): boolean {
    return reserva.status === StatusReserva.PENDENTE ||
           reserva.status === StatusReserva.AGUARDANDO_AJUSTES;
  }
}
