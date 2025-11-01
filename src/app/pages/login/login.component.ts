import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  email = '';
  password = '';

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.notificationService.show('Por favor, preencha todos os campos.', 'error');
      return;
    }

    this.authService.login(this.email, this.password).then(
      () => {
        this.notificationService.show('Login realizado com sucesso!', 'success');
      },
      (error) => {
        this.notificationService.show(error || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
      }
    );
  }
}