import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSignal = signal<Notification | null>(null);
  
  notification = this.notificationSignal.asReadonly();
  
  show(message: string, type: Notification['type'] = 'success'): void {
    this.notificationSignal.set({ message, type });
    setTimeout(() => this.notificationSignal.set(null), 4000);
  }
  
  clear(): void {
    this.notificationSignal.set(null);
  }
}