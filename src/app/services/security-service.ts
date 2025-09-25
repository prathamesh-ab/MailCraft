// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class SecurityService {
  
// }

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  
  constructor() {
    this.enforceHttpsOnInit();
  }

  private enforceHttpsOnInit(): void {
    if (environment.production && this.shouldEnforceHttps()) {
      this.redirectToHttps();
    }
  }

  private shouldEnforceHttps(): boolean {
    return typeof window !== 'undefined' && 
           window.location.protocol === 'http:' &&
           window.location.hostname !== 'localhost' &&
           window.location.hostname !== '127.0.0.1';
  }

  private redirectToHttps(): void {
    const httpsUrl = window.location.href.replace('http:', 'https:');
    window.location.replace(httpsUrl);
  }

  isSecure(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.protocol === 'https:' || 
            window.location.hostname === 'localhost');
  }
}