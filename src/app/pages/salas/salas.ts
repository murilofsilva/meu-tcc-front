import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LaboratorioService } from '../../services/laboratorio.service';
import { NotificationService } from '../../core/notification.service';
import {
  CreateDisponibilidadeRequest,
  CreateLaboratorioRequest,
  DiaSemana,
  DIAS_SEMANA_LABELS,
  DIAS_SEMANA_ORDEM,
  Disponibilidade,
  Indisponibilidade,
  Laboratorio,
  UpdateLaboratorioRequest
} from '../../models/laboratorio.models';

interface JanelaForm {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salas.html',
  styleUrl: './salas.css'
})
export class Salas implements OnInit {
  private laboratorioService = inject(LaboratorioService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  salas: Laboratorio[] = [];
  isLoading = false;
  showForm = false;
  isSubmitting = false;
  isEditing = false;

  salaId: number | null = null;
  nome = '';
  capacidade: number | null = null;
  quantidadeComputadores: number | null = null;
  descricao = '';

  showDisponibilidadesPanel = false;
  salaDisponibilidades: Laboratorio | null = null;
  janelas: JanelaForm[] = [];
  isSavingDisp = false;

  indisponibilidades: Indisponibilidade[] = [];
  novoBloqueioInicio = '';
  novoBloqueioFim = '';
  novoBloqueioMotivo = '';

  diasSemanaOrdem = DIAS_SEMANA_ORDEM;
  diasSemanaLabel = DIAS_SEMANA_LABELS;

  ngOnInit(): void {
    this.carregarSalas();
  }

  carregarSalas(): void {
    this.isLoading = true;
    this.laboratorioService.listar().subscribe({
      next: (salas) => {
        this.salas = salas;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.show('Erro ao carregar salas.', 'error');
        this.isLoading = false;
      }
    });
  }

  abrirFormularioCadastro(): void {
    this.limparFormulario();
    this.isEditing = false;
    this.showForm = true;
  }

  abrirFormularioEdicao(sala: Laboratorio): void {
    this.salaId = sala.id;
    this.nome = sala.nome;
    this.capacidade = sala.capacidade;
    this.quantidadeComputadores = sala.quantidadeComputadores;
    this.descricao = sala.descricao ?? '';
    this.isEditing = true;
    this.showForm = true;
  }

  fecharFormulario(): void {
    this.showForm = false;
    this.limparFormulario();
  }

  limparFormulario(): void {
    this.salaId = null;
    this.nome = '';
    this.capacidade = null;
    this.quantidadeComputadores = null;
    this.descricao = '';
  }

  onSubmit(): void {
    if (!this.nome || this.capacidade === null || this.capacidade < 0) {
      this.notificationService.show('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }

    if (this.quantidadeComputadores !== null && this.quantidadeComputadores < 0) {
      this.notificationService.show('Quantidade de computadores não pode ser negativa.', 'error');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditing && this.salaId) {
      this.atualizarSala();
    } else {
      this.cadastrarSala();
    }
  }

  private cadastrarSala(): void {
    const data: CreateLaboratorioRequest = {
      nome: this.nome.trim(),
      capacidade: this.capacidade!,
      quantidadeComputadores: this.quantidadeComputadores || 0,
      descricao: this.descricao.trim() || null
    };

    this.laboratorioService.cadastrar(data).subscribe({
      next: () => {
        this.notificationService.show('Sala cadastrada com sucesso!', 'success');
        this.fecharFormulario();
        this.carregarSalas();
        this.isSubmitting = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.mensagem || 'Erro ao cadastrar sala.';
        this.notificationService.show(errorMessage, 'error');
        this.isSubmitting = false;
      }
    });
  }

  private atualizarSala(): void {
    const data: UpdateLaboratorioRequest = {
      nome: this.nome.trim(),
      capacidade: this.capacidade!,
      quantidadeComputadores: this.quantidadeComputadores || 0,
      descricao: this.descricao.trim() || null
    };

    this.laboratorioService.atualizar(this.salaId!, data).subscribe({
      next: () => {
        this.notificationService.show('Sala atualizada com sucesso!', 'success');
        this.fecharFormulario();
        this.carregarSalas();
        this.isSubmitting = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.mensagem || 'Erro ao atualizar sala.';
        this.notificationService.show(errorMessage, 'error');
        this.isSubmitting = false;
      }
    });
  }

  alterarStatus(sala: Laboratorio): void {
    const novoStatus = !sala.status;
    const acao = novoStatus ? 'ativar' : 'desativar';

    if (!confirm(`Deseja realmente ${acao} a sala "${sala.nome}"?`)) {
      return;
    }

    this.laboratorioService.alterarStatus(sala.id, novoStatus).subscribe({
      next: () => {
        this.notificationService.show(`Sala ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`, 'success');
        this.carregarSalas();
      },
      error: (error) => {
        const errorMessage = error?.error?.mensagem || `Erro ao ${acao} sala.`;
        this.notificationService.show(errorMessage, 'error');
      }
    });
  }

  deletarSala(sala: Laboratorio): void {
    if (!confirm(`Deseja realmente excluir a sala "${sala.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    this.laboratorioService.deletar(sala.id).subscribe({
      next: () => {
        this.notificationService.show('Sala excluída com sucesso!', 'success');
        this.carregarSalas();
      },
      error: (error) => {
        const errorMessage = error?.error?.mensagem || 'Erro ao excluir sala. Pode haver reservas vinculadas.';
        this.notificationService.show(errorMessage, 'error');
      }
    });
  }

  abrirDisponibilidades(sala: Laboratorio): void {
    this.salaDisponibilidades = sala;
    this.showDisponibilidadesPanel = true;
    this.janelas = [];
    this.indisponibilidades = [];

    this.laboratorioService.listarDisponibilidades(sala.id).subscribe({
      next: (lista) => this.janelas = lista.map(d => ({
        diaSemana: d.diaSemana,
        horaInicio: d.horaInicio,
        horaFim: d.horaFim
      })),
      error: () => this.notificationService.show('Erro ao carregar disponibilidades', 'error')
    });

    this.laboratorioService.listarIndisponibilidades(sala.id).subscribe({
      next: (lista) => this.indisponibilidades = lista,
      error: () => this.notificationService.show('Erro ao carregar bloqueios', 'error')
    });
  }

  fecharDisponibilidades(): void {
    this.showDisponibilidadesPanel = false;
    this.salaDisponibilidades = null;
    this.janelas = [];
    this.indisponibilidades = [];
    this.novoBloqueioInicio = '';
    this.novoBloqueioFim = '';
    this.novoBloqueioMotivo = '';
  }

  adicionarJanela(): void {
    this.janelas = [...this.janelas, {
      diaSemana: DiaSemana.MONDAY,
      horaInicio: '08:00',
      horaFim: '17:00'
    }];
  }

  removerJanela(idx: number): void {
    this.janelas = this.janelas.filter((_, i) => i !== idx);
  }

  salvarJanelas(): void {
    if (!this.salaDisponibilidades) return;
    for (const j of this.janelas) {
      if (!j.diaSemana || !j.horaInicio || !j.horaFim || j.horaFim <= j.horaInicio) {
        this.notificationService.show(
          'Cada janela precisa de dia da semana, hora início e hora fim válidos',
          'error'
        );
        return;
      }
    }
    this.isSavingDisp = true;
    const payload: CreateDisponibilidadeRequest[] = this.janelas.map(j => ({
      diaSemana: j.diaSemana,
      horaInicio: j.horaInicio,
      horaFim: j.horaFim
    }));
    this.laboratorioService.substituirDisponibilidades(this.salaDisponibilidades.id, payload).subscribe({
      next: () => {
        this.notificationService.show('Disponibilidades atualizadas!', 'success');
        this.isSavingDisp = false;
      },
      error: (error) => {
        this.isSavingDisp = false;
        const mensagem = error?.error?.mensagem || 'Erro ao salvar disponibilidades';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  adicionarBloqueio(): void {
    if (!this.salaDisponibilidades) return;
    if (!this.novoBloqueioInicio || !this.novoBloqueioFim || !this.novoBloqueioMotivo.trim()) {
      this.notificationService.show('Preencha início, fim e motivo do bloqueio', 'error');
      return;
    }
    if (this.novoBloqueioFim <= this.novoBloqueioInicio) {
      this.notificationService.show('Data fim deve ser posterior ao início', 'error');
      return;
    }
    this.laboratorioService.criarIndisponibilidade(this.salaDisponibilidades.id, {
      inicio: new Date(this.novoBloqueioInicio).toISOString(),
      fim: new Date(this.novoBloqueioFim).toISOString(),
      motivo: this.novoBloqueioMotivo.trim()
    }).subscribe({
      next: (bloqueio) => {
        this.indisponibilidades = [...this.indisponibilidades, bloqueio];
        this.novoBloqueioInicio = '';
        this.novoBloqueioFim = '';
        this.novoBloqueioMotivo = '';
        this.notificationService.show('Bloqueio adicionado', 'success');
      },
      error: (error) => {
        const mensagem = error?.error?.mensagem || 'Erro ao criar bloqueio';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  removerBloqueio(b: Indisponibilidade): void {
    if (!this.salaDisponibilidades) return;
    if (!confirm(`Remover o bloqueio "${b.motivo}"?`)) return;
    this.laboratorioService.removerIndisponibilidade(this.salaDisponibilidades.id, b.id).subscribe({
      next: () => {
        this.indisponibilidades = this.indisponibilidades.filter(x => x.id !== b.id);
        this.notificationService.show('Bloqueio removido', 'success');
      },
      error: (error) => {
        const mensagem = error?.error?.mensagem || 'Erro ao remover bloqueio';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  formatBloqueio(d: string): string {
    return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}
