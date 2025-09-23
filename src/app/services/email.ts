import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { EmailRequest, EmailResponse, ApiResponse, SupportedOption } from '../models/email.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateEmail(request: EmailRequest): Observable<ApiResponse<EmailResponse>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<ApiResponse<EmailResponse>>(
      `${this.apiUrl}/generate`, 
      request, 
      { headers }
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getSupportedLanguages(): Observable<ApiResponse<{ languages: SupportedOption[] }>> {
    return this.http.get<ApiResponse<{ languages: SupportedOption[] }>>(
      `${this.apiUrl}/supported-languages`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSupportedTones(): Observable<ApiResponse<{ tones: SupportedOption[] }>> {
    return this.http.get<ApiResponse<{ tones: SupportedOption[] }>>(
      `${this.apiUrl}/supported-tones`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSupportedComplexity(): Observable<ApiResponse<{ complexityLevels: SupportedOption[] }>> {
    return this.http.get<ApiResponse<{ complexityLevels: SupportedOption[] }>>(
      `${this.apiUrl}/supported-complexity`
    ).pipe(
      catchError(this.handleError)
    );
  }

  healthCheck(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('Email Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
