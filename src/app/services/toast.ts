// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class Toast {
  
// }
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {  // ✅ Make sure this is exported
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  showToast(message: string, type: Toast['type'] = 'info', duration: number = 3000) {
    const toast: Toast = {
      id: Date.now().toString(),
      message,
      type,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: string) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  success(message: string) {
    this.showToast(message, 'success');
  }

  error(message: string) {
    this.showToast(message, 'error');
  }

  info(message: string) {
    this.showToast(message, 'info');
  }

  warning(message: string) {
    this.showToast(message, 'warning');
  }
}