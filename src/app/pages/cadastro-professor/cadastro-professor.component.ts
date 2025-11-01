import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessorService } from '../../services/professor.service';
import { NotificationService } from '../../core/notification.service';
import { RegisterProfessorRequest } from '../../models/auth.models';

@Component({
  selector: 'app-cadastro-professor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-professor.component.html',
  styleUrls: ['./cadastro-professor.component.css']
})
export class CadastroProfessorComponent {
  private professorService = inject(ProfessorService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  isSubmitting = false;

  onSubmit(): void {
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      this.notificationService.show('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.notificationService.show('As senhas não coincidem.', 'error');
      return;
    }

    if (this.senha.length < 6) {
      this.notificationService.show('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    this.isSubmitting = true;

    const data: RegisterProfessorRequest = {
      nome: this.nome,
      email: this.email,
      senha: this.senha
    };

    this.professorService.cadastrar(data).subscribe({
      next: (usuario) => {
        this.notificationService.show('Professor cadastrado com sucesso!', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        const errorMessage = error?.error?.mensagem || error?.message || 'Erro ao cadastrar professor.';
        this.notificationService.show(errorMessage, 'error');
        this.isSubmitting = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}
