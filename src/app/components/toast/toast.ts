// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-toast',
//   imports: [],
//   templateUrl: './toast.html',
//   styleUrl: './toast.css'
// })
// export class Toast {

// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastService, Toast as ToastInterface } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class Toast implements OnInit {
  toasts$: Observable<ToastInterface[]>; // ✅ Use the aliased interface

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {}

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }
}
