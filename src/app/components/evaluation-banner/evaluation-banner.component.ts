import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Banner temporário de convite para avaliar o sistema.
 * Dispensa por sessão via LocalStorage.
 */
const STORAGE_KEY = 'avaliacao-banner-dispensado';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfzx7_5XpBwffSpfGfhq83CndvNoGoT5EGgsUQevkI1eXAUQg/viewform';

@Component({
  selector: 'app-evaluation-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visivel()) {
      <div
        role="region"
        aria-label="Convite para avaliar o sistema"
        class="bg-red-600 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md"
      >
        <p class="text-sm sm:text-base flex items-center gap-2">
          <span aria-hidden="true">📣</span>
          Sua opinião é importante! Ajude-nos a melhorar respondendo a uma rápida avaliação do sistema.
        </p>
        <div class="flex items-center gap-2">
          <a
            [href]="formUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white text-red-700 px-3 py-1 rounded font-semibold text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Avaliar o sistema
          </a>
          <button
            type="button"
            (click)="dispensar()"
            class="text-white/90 hover:text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Dispensar banner de avaliação"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    }
  `
})
export class EvaluationBannerComponent {
  readonly formUrl = FORM_URL;
  private dispensado = signal<boolean>(this.lerStorage());

  visivel = computed(() => !this.dispensado());

  private lerStorage(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  dispensar(): void {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignora se LocalStorage indisponível
    }
    this.dispensado.set(true);
  }
}
