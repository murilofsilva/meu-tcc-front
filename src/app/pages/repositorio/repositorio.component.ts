import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanejamentoService } from '../../services/planejamento.service';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';
import {
  Planejamento,
  StatusPlanejamento,
  PlanejamentoFiltros
} from '../../models/planejamento.models';
import { Reserva } from '../../models/reserva.models';

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repositorio.component.html',
  styleUrls: ['./repositorio.component.css']
})
export class RepositorioComponent implements OnInit {
  private planejamentoService = inject(PlanejamentoService);
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  planejamentos: Planejamento[] = [];
  planejamentosFiltrados: Planejamento[] = [];
  expandedFilters = true;

  // Filtros
  filtros: PlanejamentoFiltros = {
    palavraChave: '',
    area: '',
    authorId: undefined,
    status: undefined
  };

  // Opções para os filtros
  areas: string[] = [
    'Matemática',
    'Português',
    'Ciências',
    'História',
    'Geografia',
    'Computação',
    'Ética',
    'Arte',
    'Educação Física',
    'Inglês'
  ];

  statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: StatusPlanejamento.PUBLICADO, label: 'Publicado' },
    { value: StatusPlanejamento.PENDENTE, label: 'Pendente' },
    { value: StatusPlanejamento.AGUARDANDO_AJUSTES, label: 'Aguardando Ajustes' },
    { value: StatusPlanejamento.REPROVADO, label: 'Reprovado' }
  ];

  filtroAutor = 'todos'; // 'todos', 'meus', ou id específico

  user = this.authService.user;
  StatusPlanejamento = StatusPlanejamento;

  ngOnInit(): void {
    this.carregarPlanejamentos();
  }

  carregarPlanejamentos(): void {
    this.planejamentoService.listar().subscribe({
      next: (planejamentos) => {
        this.planejamentos = planejamentos;
        this.aplicarFiltros();
      },
      error: (error) => {
        this.notificationService.show('Erro ao carregar planejamentos', 'error');
        console.error('Erro ao carregar planejamentos:', error);
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.planejamentos];

    // Filtro por palavra-chave
    if (this.filtros.palavraChave && this.filtros.palavraChave.trim()) {
      const palavraChave = this.filtros.palavraChave.toLowerCase().trim();
      resultado = resultado.filter(p =>
        p.titulo.toLowerCase().includes(palavraChave) ||
        p.descricao.toLowerCase().includes(palavraChave) ||
        p.area.toLowerCase().includes(palavraChave)
      );
    }

    // Filtro por área
    if (this.filtros.area) {
      resultado = resultado.filter(p => p.area === this.filtros.area);
    }

    // Filtro por autor
    if (this.filtroAutor === 'meus') {
      const userId = this.user()?.id;
      resultado = resultado.filter(p => p.author.id === userId);
    }

    // Filtro por status
    if (this.filtros.status) {
      resultado = resultado.filter(p => p.status === this.filtros.status);
    }

    this.planejamentosFiltrados = resultado;
  }

  limparFiltros(): void {
    this.filtros = {
      palavraChave: '',
      area: '',
      authorId: undefined,
      status: undefined
    };
    this.filtroAutor = 'todos';
    this.aplicarFiltros();
  }

  onFiltroAutorChange(): void {
    if (this.filtroAutor === 'meus') {
      this.filtros.authorId = this.user()?.id;
    } else {
      this.filtros.authorId = undefined;
    }
    this.aplicarFiltros();
  }

  importarParaReserva(planejamento: Planejamento): void {
    this.planejamentoParaImportar = planejamento;
    this.isImportModalOpen = true;
    this.carregarReservasFuturas();
  }

  carregarReservasFuturas(): void {
    this.isLoadingReservas = true;
    this.reservaService.listarFuturas().subscribe({
      next: (reservas) => {
        this.reservasFuturas = reservas;
        this.isLoadingReservas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar reservas futuras:', error);
        this.notificationService.show('Erro ao carregar reservas', 'error');
        this.isLoadingReservas = false;
      }
    });
  }

  vincularPlanejamentoAReserva(reserva: Reserva): void {
    if (!this.planejamentoParaImportar) return;

    this.reservaService.vincularPlanejamento(reserva.id, this.planejamentoParaImportar.id).subscribe({
      next: () => {
        this.notificationService.show(
          `Plano "${this.planejamentoParaImportar!.titulo}" vinculado à reserva "${reserva.titulo}" com sucesso!`,
          'success'
        );
        this.fecharModalImportar();
      },
      error: (error) => {
        console.error('Erro ao vincular planejamento:', error);
        const mensagem = error?.error?.mensagem || 'Erro ao vincular planejamento à reserva';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  fecharModalImportar(): void {
    this.isImportModalOpen = false;
    this.planejamentoParaImportar = null;
    this.reservasFuturas = [];
  }

  criarNovaReserva(): void {
    if (!this.planejamentoParaImportar) return;

    // Navega para a página de agendamentos passando o planejamento selecionado
    this.router.navigate(['/agendamentos'], {
      state: { planejamentoSelecionado: this.planejamentoParaImportar }
    });
    this.notificationService.show(
      `Criando nova reserva com o plano "${this.planejamentoParaImportar.titulo}"`,
      'success'
    );
    this.fecharModalImportar();
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

  editarPlanejamento(planejamento: Planejamento): void {
    this.router.navigate(['/planejamento-form', planejamento.id]);
  }

  // Modal de detalhes
  isDetailsModalOpen = false;
  selectedPlanejamento: Planejamento | null = null;

  // Modal de importar para reserva
  isImportModalOpen = false;
  reservasFuturas: Reserva[] = [];
  isLoadingReservas = false;
  planejamentoParaImportar: Planejamento | null = null;

  visualizarDetalhes(planejamento: Planejamento): void {
    this.selectedPlanejamento = planejamento;
    this.isDetailsModalOpen = true;
  }

  fecharModalDetalhes(): void {
    this.isDetailsModalOpen = false;
    this.selectedPlanejamento = null;
  }

  novoPlanejamento(): void {
    this.router.navigate(['/planejamento-form']);
  }

  voltarDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getStatusClass(status: StatusPlanejamento): string {
    switch (status) {
      case StatusPlanejamento.PUBLICADO:
        return 'bg-green-100 text-green-800';
      case StatusPlanejamento.PENDENTE:
        return 'bg-yellow-100 text-yellow-800';
      case StatusPlanejamento.AGUARDANDO_AJUSTES:
        return 'bg-orange-100 text-orange-800';
      case StatusPlanejamento.REPROVADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: StatusPlanejamento): string {
    switch (status) {
      case StatusPlanejamento.PUBLICADO:
        return 'Publicado';
      case StatusPlanejamento.PENDENTE:
        return 'Pendente';
      case StatusPlanejamento.AGUARDANDO_AJUSTES:
        return 'Aguardando Ajustes';
      case StatusPlanejamento.REPROVADO:
        return 'Reprovado';
      default:
        return status;
    }
  }

  podeEditar(planejamento: Planejamento): boolean {
    const userId = this.user()?.id;
    return planejamento.author.id === userId;
  }
}
