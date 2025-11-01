import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LaboratorioService } from '../../services/laboratorio.service';
import { NotificationService } from '../../core/notification.service';
import { Laboratorio, CreateLaboratorioRequest, UpdateLaboratorioRequest } from '../../models/laboratorio.models';

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

  // Campos do formulário
  salaId: number | null = null;
  nome = '';
  capacidade: number | null = null;
  qtdEquipamentos: number | null = null;

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
      error: (error) => {
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
    this.qtdEquipamentos = sala.qtdEquipamentos;
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
    this.qtdEquipamentos = null;
  }

  onSubmit(): void {
    if (!this.nome || this.capacidade === null || this.capacidade < 0) {
      this.notificationService.show('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }

    if (this.qtdEquipamentos !== null && this.qtdEquipamentos < 0) {
      this.notificationService.show('Quantidade de equipamentos não pode ser negativa.', 'error');
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
      qtdEquipamentos: this.qtdEquipamentos || 0
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
      qtdEquipamentos: this.qtdEquipamentos || 0
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

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}
