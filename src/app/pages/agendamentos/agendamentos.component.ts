import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { LaboratorioService } from '../../services/laboratorio.service';
import { PlanejamentoService } from '../../services/planejamento.service';
import { NotificationService } from '../../core/notification.service';
import { Reserva, CreateReservaRequest, UpdateReservaRequest, StatusReserva } from '../../models/reserva.models';
import { Laboratorio } from '../../models/laboratorio.models';
import { Planejamento } from '../../models/planejamento.models';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.css']
})
export class AgendamentosComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private laboratorioService = inject(LaboratorioService);
  private planejamentoService = inject(PlanejamentoService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  reservas: Reserva[] = [];
  laboratorios: Laboratorio[] = [];
  planejamentos: Planejamento[] = [];
  reservasConflitantes: Reserva[] = [];
  isLoading = false;
  isLoadingConflitos = false;
  showForm = false;
  isSubmitting = false;
  isEditing = false;

  // Form fields
  reservaId: number | null = null;
  laboratorioId: number | null = null;
  data: string = '';
  horaInicio: string = '';
  horaFim: string = '';
  titulo: string = '';
  turma: string = '';
  descricao: string = '';
  planejamentoSelecionado: Planejamento | null = null;
  planejamentoId: number | null = null;

  // Status enum para o template
  StatusReserva = StatusReserva;

  ngOnInit(): void {
    this.carregarReservas();
    this.carregarLaboratorios();
    this.carregarPlanejamentos();

    // Verifica se há um planejamento selecionado vindo do repositório
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;

    if (state?.['planejamentoSelecionado']) {
      this.planejamentoSelecionado = state['planejamentoSelecionado'];
      this.planejamentoId = this.planejamentoSelecionado?.id || null;
      this.titulo = this.planejamentoSelecionado?.titulo || '';
      this.descricao = this.planejamentoSelecionado?.descricao || '';
      this.showForm = true;
    }
  }

  carregarPlanejamentos(): void {
    // Lista planejamentos do professor (próprios + públicos de outros)
    this.planejamentoService.listar().subscribe({
      next: (planejamentos) => {
        this.planejamentos = planejamentos;
      },
      error: (error) => {
        console.error('Erro ao carregar planejamentos:', error);
      }
    });
  }

  carregarReservas(): void {
    this.isLoading = true;
    this.reservaService.listar().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar reservas:', error);
        this.notificationService.show('Erro ao carregar reservas', 'error');
        this.isLoading = false;
      }
    });
  }

  carregarLaboratorios(): void {
    this.laboratorioService.listar(true).subscribe({
      next: (laboratorios) => {
        this.laboratorios = laboratorios;
      },
      error: (error) => {
        console.error('Erro ao carregar laboratórios:', error);
      }
    });
  }

  abrirFormularioCadastro(): void {
    this.limparFormulario();
    this.isEditing = false;
    this.showForm = true;
  }

  abrirFormularioEdicao(reserva: Reserva): void {
    // Só permite editar se estiver PENDENTE ou AGUARDANDO_AJUSTES
    if (reserva.status !== StatusReserva.PENDENTE && reserva.status !== StatusReserva.AGUARDANDO_AJUSTES) {
      this.notificationService.show('Apenas reservas pendentes ou aguardando ajustes podem ser editadas', 'error');
      return;
    }

    this.isEditing = true;
    this.reservaId = reserva.id;
    this.laboratorioId = reserva.laboratorio.id;
    this.titulo = reserva.titulo;
    this.turma = reserva.turma || '';
    this.descricao = reserva.descricao || '';

    // Separa data e hora
    const inicioDate = new Date(reserva.inicio);
    const fimDate = new Date(reserva.fim);

    this.data = this.formatDateForInput(inicioDate);
    this.horaInicio = this.formatTimeForInput(inicioDate);
    this.horaFim = this.formatTimeForInput(fimDate);

    this.showForm = true;

    // Verifica conflitos após abrir o formulário
    this.verificarConflitos();
  }

  fecharFormulario(): void {
    this.showForm = false;
    this.limparFormulario();
  }

  limparFormulario(): void {
    this.reservaId = null;
    this.laboratorioId = null;
    this.data = '';
    this.horaInicio = '';
    this.horaFim = '';
    this.titulo = '';
    this.turma = '';
    this.descricao = '';
    this.planejamentoSelecionado = null;
    this.planejamentoId = null;
    this.reservasConflitantes = [];
  }

  onLaboratorioOuDataChange(): void {
    // Verifica conflitos quando laboratório ou data mudarem
    if (this.laboratorioId && this.data) {
      this.verificarConflitos();
    } else {
      this.reservasConflitantes = [];
    }
  }

  verificarConflitos(): void {
    if (!this.laboratorioId || !this.data) {
      return;
    }

    this.isLoadingConflitos = true;

    // Cria início e fim do dia selecionado
    const inicioDia = new Date(`${this.data}T00:00:00`);
    const fimDia = new Date(`${this.data}T23:59:59`);

    this.reservaService.buscarPorLaboratorioEPeriodo(
      this.laboratorioId,
      inicioDia.toISOString(),
      fimDia.toISOString()
    ).subscribe({
      next: (reservas) => {
        // Filtra apenas reservas que não são a atual (em caso de edição)
        this.reservasConflitantes = reservas.filter(r => r.id !== this.reservaId);
        this.isLoadingConflitos = false;
      },
      error: (error) => {
        console.error('Erro ao verificar conflitos:', error);
        this.reservasConflitantes = [];
        this.isLoadingConflitos = false;
      }
    });
  }

  onSubmit(): void {
    // Validação de campos obrigatórios
    if (!this.laboratorioId || !this.data || !this.horaInicio || !this.horaFim || !this.titulo) {
      this.notificationService.show('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Validação: título mínimo 3 caracteres
    if (this.titulo.length < 3) {
      this.notificationService.show('O título deve ter no mínimo 3 caracteres.', 'error');
      return;
    }

    // Combina data e hora (mesma data para início e fim)
    const inicio = new Date(`${this.data}T${this.horaInicio}`);
    const fim = new Date(`${this.data}T${this.horaFim}`);

    // Validação: hora de fim deve ser depois da hora de início
    if (fim <= inicio) {
      this.notificationService.show('A hora de fim deve ser posterior à hora de início.', 'error');
      return;
    }

    // Validação: não pode ser no passado
    const agora = new Date();
    if (inicio < agora) {
      this.notificationService.show('Não é possível criar reservas no passado.', 'error');
      return;
    }

    // Validação: verifica conflitos localmente antes de enviar
    if (this.temConflitoLocal(inicio, fim)) {
      this.notificationService.show('Este horário conflita com outra reserva já existente.', 'error');
      return;
    }

    if (this.isEditing && this.reservaId) {
      this.atualizarReserva(inicio, fim);
    } else {
      this.criarReserva(inicio, fim);
    }
  }

  temConflitoLocal(inicio: Date, fim: Date): boolean {
    return this.reservasConflitantes.some(reserva => {
      const reservaInicio = new Date(reserva.inicio);
      const reservaFim = new Date(reserva.fim);

      // Verifica se há sobreposição
      return (inicio < reservaFim && fim > reservaInicio);
    });
  }

  criarReserva(inicio: Date, fim: Date): void {
    const request: CreateReservaRequest = {
      laboratorioId: this.laboratorioId!,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      titulo: this.titulo,
      turma: this.turma || undefined,
      descricao: this.descricao || undefined,
      planejamentoId: this.planejamentoId || undefined
    };

    this.isSubmitting = true;

    this.reservaService.criar(request).subscribe({
      next: () => {
        this.notificationService.show('Reserva criada com sucesso! Aguarde aprovação.', 'success');
        this.fecharFormulario();
        this.carregarReservas();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erro ao criar reserva:', error);
        const mensagem = error.error?.mensagem || 'Erro ao criar reserva';
        this.notificationService.show(mensagem, 'error');
        this.isSubmitting = false;
      }
    });
  }

  atualizarReserva(inicio: Date, fim: Date): void {
    const request: UpdateReservaRequest = {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      titulo: this.titulo,
      turma: this.turma || undefined,
      descricao: this.descricao || undefined
    };

    this.isSubmitting = true;

    this.reservaService.atualizar(this.reservaId!, request).subscribe({
      next: () => {
        this.notificationService.show('Reserva atualizada com sucesso!', 'success');
        this.fecharFormulario();
        this.carregarReservas();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar reserva:', error);
        const mensagem = error.error?.mensagem || 'Erro ao atualizar reserva';
        this.notificationService.show(mensagem, 'error');
        this.isSubmitting = false;
      }
    });
  }

  cancelarReserva(reserva: Reserva): void {
    if (!confirm(`Tem certeza que deseja cancelar a reserva "${reserva.titulo}"?`)) {
      return;
    }

    this.reservaService.cancelar(reserva.id).subscribe({
      next: () => {
        this.notificationService.show('Reserva cancelada com sucesso.', 'success');
        this.carregarReservas();
      },
      error: (error) => {
        console.error('Erro ao cancelar reserva:', error);
        const mensagem = error.error?.mensagem || 'Erro ao cancelar reserva';
        this.notificationService.show(mensagem, 'error');
      }
    });
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

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTimeForInput(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  podeEditar(reserva: Reserva): boolean {
    return reserva.status === StatusReserva.PENDENTE ||
           reserva.status === StatusReserva.AGUARDANDO_AJUSTES;
  }
}
