import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { EmailForm } from './components/email-form/email-form';
import { Toast } from './components/toast/toast';
import { environment } from '../environments/environment.prod';
// import { EmailForm } from './components/email-form/email-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, EmailForm,Toast],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('mailcraft');

 ngOnInit() {
    // Force HTTPS in production
    if (environment.production && environment.forceHttps) {
      this.enforceHttps();
    }
  }

  private enforceHttps() {
    if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
      const httpsUrl = window.location.href.replace('http:', 'https:');
      window.location.replace(httpsUrl);
    }
  }
}
