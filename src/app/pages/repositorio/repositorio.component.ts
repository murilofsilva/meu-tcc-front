import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanejamentoService } from '../../services/planejamento.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';
import {
  Planejamento,
  StatusPlanejamento,
  PlanejamentoFiltros
} from '../../models/planejamento.models';

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repositorio.component.html',
  styleUrls: ['./repositorio.component.css']
})
export class RepositorioComponent implements OnInit {
  private planejamentoService = inject(PlanejamentoService);
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
    // Navega para a página de agendamentos passando o planejamento selecionado
    this.router.navigate(['/agendamentos'], {
      state: { planejamentoSelecionado: planejamento }
    });
    this.notificationService.show(
      `Plano "${planejamento.titulo}" pronto para ser agendado.`,
      'success'
    );
  }

  editarPlanejamento(planejamento: Planejamento): void {
    this.router.navigate(['/planejamento-form', planejamento.id]);
  }

  // Modal de detalhes
  isDetailsModalOpen = false;
  selectedPlanejamento: Planejamento | null = null;

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
