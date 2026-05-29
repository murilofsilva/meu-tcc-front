import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AreaConhecimentoService } from '../../services/area-conhecimento.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';
import { AreaConhecimento } from '../../models/planejamento.models';
import { PerfilUsuario } from '../../models/auth.models';

@Component({
  selector: 'app-disciplinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disciplinas.component.html',
  styleUrls: ['./disciplinas.component.css']
})
export class DisciplinasComponent implements OnInit {
  private areaService = inject(AreaConhecimentoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  disciplinas: AreaConhecimento[] = [];
  isLoading = false;
  isSubmitting = false;

  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  formNome = '';
  formAtivo = true;

  ngOnInit(): void {
    if (!this.podeGerir()) {
      this.notificationService.show('Apenas gestores podem acessar esta área', 'error');
      this.router.navigate(['/dashboard']);
      return;
    }
    this.carregar();
  }

  podeGerir(): boolean {
    const u = this.authService.user();
    return u?.perfil === PerfilUsuario.DIRETOR || u?.perfil === PerfilUsuario.ADMIN;
  }

  carregar(): void {
    this.isLoading = true;
    this.areaService.listar(false).subscribe({
      next: (disciplinas) => {
        this.disciplinas = disciplinas;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.show('Erro ao carregar disciplinas', 'error');
        this.isLoading = false;
      }
    });
  }

  abrirNova(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formNome = '';
    this.formAtivo = true;
    this.showForm = true;
  }

  abrirEdicao(d: AreaConhecimento): void {
    this.isEditing = true;
    this.editingId = d.id;
    this.formNome = d.nome;
    this.formAtivo = d.ativo;
    this.showForm = true;
  }

  fecharForm(): void {
    this.showForm = false;
  }

  salvar(): void {
    const nome = this.formNome.trim();
    if (nome.length < 2) {
      this.notificationService.show('O nome deve ter pelo menos 2 caracteres', 'error');
      return;
    }
    this.isSubmitting = true;

    const obs = this.isEditing && this.editingId
      ? this.areaService.atualizar(this.editingId, { nome, ativo: this.formAtivo })
      : this.areaService.criar({ nome, ativo: this.formAtivo });

    obs.subscribe({
      next: () => {
        this.notificationService.show(
          this.isEditing ? 'Disciplina atualizada!' : 'Disciplina cadastrada!',
          'success'
        );
        this.fecharForm();
        this.carregar();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        const mensagem = error?.error?.mensagem || error?.error?.message || 'Erro ao salvar disciplina';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  alternarAtivo(d: AreaConhecimento): void {
    this.areaService.atualizar(d.id, { ativo: !d.ativo }).subscribe({
      next: () => {
        this.notificationService.show(
          `Disciplina ${!d.ativo ? 'ativada' : 'inativada'}`,
          'success'
        );
        this.carregar();
      },
      error: (error) => {
        const mensagem = error?.error?.mensagem || 'Erro ao alterar status';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  excluir(d: AreaConhecimento): void {
    if (!confirm(`Excluir a disciplina "${d.nome}"?\n\nSe houver planos vinculados, considere inativá-la em vez de excluir.`)) {
      return;
    }
    this.areaService.deletar(d.id).subscribe({
      next: () => {
        this.notificationService.show('Disciplina excluída', 'success');
        this.carregar();
      },
      error: (error) => {
        const mensagem = error?.error?.mensagem || error?.error?.message || 'Erro ao excluir disciplina';
        this.notificationService.show(mensagem, 'error');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}
