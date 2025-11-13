import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanejamentoService } from '../../services/planejamento.service';
import { NotificationService } from '../../core/notification.service';
import {
  Planejamento,
  CreatePlanejamentoRequest,
  UpdatePlanejamentoRequest
} from '../../models/planejamento.models';

@Component({
  selector: 'app-planejamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planejamento-form.component.html',
  styleUrls: ['./planejamento-form.component.css']
})
export class PlanejamentoFormComponent implements OnInit {
  private planejamentoService = inject(PlanejamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  isEditMode = false;
  planejamentoId?: number;
  planejamento?: Planejamento;

  // Dados do formulário
  formData = {
    titulo: '',
    area: '',
    descricao: ''
  };

  // Opções para o select de área
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

  isSubmitting = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.planejamentoId = parseInt(id, 10);
      this.carregarPlanejamento();
    }
  }

  carregarPlanejamento(): void {
    if (!this.planejamentoId) return;

    this.planejamentoService.buscarPorId(this.planejamentoId).subscribe({
      next: (planejamento) => {
        this.planejamento = planejamento;
        this.formData = {
          titulo: planejamento.titulo,
          area: planejamento.area,
          descricao: planejamento.descricao
        };
      },
      error: (error) => {
        this.notificationService.show('Erro ao carregar planejamento', 'error');
        console.error('Erro ao carregar planejamento:', error);
        this.voltarRepositorio();
      }
    });
  }

  onSubmit(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.planejamentoId) {
      this.atualizarPlanejamento();
    } else {
      this.criarPlanejamento();
    }
  }

  validarFormulario(): boolean {
    if (!this.formData.titulo.trim()) {
      this.notificationService.show('Por favor, informe o título do plano de aula', 'error');
      return false;
    }

    if (!this.formData.area) {
      this.notificationService.show('Por favor, selecione uma área/disciplina', 'error');
      return false;
    }

    if (!this.formData.descricao.trim()) {
      this.notificationService.show('Por favor, informe a descrição do plano de aula', 'error');
      return false;
    }

    if (this.formData.descricao.trim().length < 20) {
      this.notificationService.show('A descrição deve ter pelo menos 20 caracteres', 'error');
      return false;
    }

    return true;
  }

  criarPlanejamento(): void {
    const request: CreatePlanejamentoRequest = {
      titulo: this.formData.titulo.trim(),
      area: this.formData.area,
      descricao: this.formData.descricao.trim()
    };

    this.planejamentoService.criar(request).subscribe({
      next: (planejamento) => {
        this.notificationService.show('Plano de aula criado com sucesso!', 'success');
        this.router.navigate(['/repositorio']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Erro ao criar plano de aula';
        this.notificationService.show(errorMessage, 'error');
        console.error('Erro ao criar planejamento:', error);
      }
    });
  }

  atualizarPlanejamento(): void {
    if (!this.planejamentoId) return;

    const request: UpdatePlanejamentoRequest = {
      titulo: this.formData.titulo.trim(),
      area: this.formData.area,
      descricao: this.formData.descricao.trim()
    };

    this.planejamentoService.atualizar(this.planejamentoId, request).subscribe({
      next: (planejamento) => {
        this.notificationService.show('Plano de aula atualizado com sucesso!', 'success');
        this.router.navigate(['/repositorio']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Erro ao atualizar plano de aula';
        this.notificationService.show(errorMessage, 'error');
        console.error('Erro ao atualizar planejamento:', error);
      }
    });
  }

  voltarRepositorio(): void {
    this.router.navigate(['/repositorio']);
  }

  cancelar(): void {
    if (this.formularioAlterado()) {
      if (confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
        this.voltarRepositorio();
      }
    } else {
      this.voltarRepositorio();
    }
  }

  formularioAlterado(): boolean {
    if (!this.isEditMode) {
      return !!(this.formData.titulo || this.formData.area || this.formData.descricao);
    }

    if (!this.planejamento) return false;

    return (
      this.formData.titulo !== this.planejamento.titulo ||
      this.formData.area !== this.planejamento.area ||
      this.formData.descricao !== this.planejamento.descricao
    );
  }
}
