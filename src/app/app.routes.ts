import { Routes } from '@angular/router';
import { EmailForm } from './components/email-form/email-form';

export const routes: Routes = [
  { path: '', component: EmailForm },
  { path: '**', redirectTo: '' }
];