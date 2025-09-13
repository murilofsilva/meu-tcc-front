import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user = this.authService.user;
  
  onLogoClick(): void {
    this.router.navigate(['/dashboard']);
  }
  
  onLogout(): void {
    this.authService.logout();
  }
}