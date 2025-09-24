import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../../services/email';
import { EmailRequest, SupportedOption } from '../../models/email.model';
import { Loading } from '../loading/loading';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-email-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading],
  templateUrl: './email-form.html',
  styleUrls: ['./email-form.css']
})
export class EmailForm implements OnInit, OnDestroy {
  emailForm!: FormGroup;
  isLoading = false;
  generatedEmail = '';
  errorMessage = '';
  showResult = false;
  copySuccess = false;
  isFormValid = false;

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Dropdown options
  languages: SupportedOption[] = [];
  tones: SupportedOption[] = [];
  complexityLevels: SupportedOption[] = [];

  // Action types configuration
  actionTypes = [
    { 
      code: 'compose', 
      name: 'Compose New Email', 
      description: 'Create a new email from scratch',
      icon: '✍️'
    },
    { 
      code: 'reply', 
      name: 'Reply to Email', 
      description: 'Generate a reply to an existing email',
      icon: '↩️'
    },
    { 
      code: 'formalize', 
      name: 'Formalize Email', 
      description: 'Make an informal email more professional',
      icon: '🎩'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private toastService: ToastService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSupportedOptions();
    this.setupFormValidation();
    this.setupActionTypeWatcher();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.emailForm = this.fb.group({
      actionType: ['compose', [Validators.required]],
      recipientName: [''],
      subject: [''],
      emailContent: [''],
      keywords: [''],
      tone: ['formal', [Validators.required]],
      language: ['english', [Validators.required]],
      complexity: ['simple', [Validators.required]]
    });
  }

  private setupFormValidation(): void {
    this.emailForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isFormValid = status === 'VALID';
      });
  }

  private setupActionTypeWatcher(): void {
    this.emailForm.get('actionType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onActionTypeChange();
        this.clearResult();
      });
  }

  private loadSupportedOptions(): void {
    // Load languages with error handling
    this.emailService.getSupportedLanguages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.languages = response.data.languages;
          } else {
            this.setDefaultLanguages();
          }
        },
        error: (error) => {
          console.error('Failed to load languages:', error);
          this.setDefaultLanguages();
          this.toastService.warning('Using default language options');
        }
      });

    // Load tones with error handling
    this.emailService.getSupportedTones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.tones = response.data.tones;
          } else {
            this.setDefaultTones();
          }
        },
        error: (error) => {
          console.error('Failed to load tones:', error);
          this.setDefaultTones();
          this.toastService.warning('Using default tone options');
        }
      });

    // Load complexity levels with error handling
    this.emailService.getSupportedComplexity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.complexityLevels = response.data.complexityLevels;
          } else {
            this.setDefaultComplexity();
          }
        },
        error: (error) => {
          console.error('Failed to load complexity levels:', error);
          this.setDefaultComplexity();
          this.toastService.warning('Using default complexity options');
        }
      });
  }

  private setDefaultLanguages(): void {
    this.languages = [
      { code: 'english', name: 'English', nativeName: 'English' },
      { code: 'hindi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'spanish', name: 'Spanish', nativeName: 'Español' },
      { code: 'french', name: 'French', nativeName: 'Français' }
    ];
  }

  private setDefaultTones(): void {
    this.tones = [
      { code: 'formal', name: 'Formal', description: 'Professional and structured' },
      { code: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
      { code: 'professional', name: 'Professional', description: 'Business-appropriate' },
      { code: 'friendly', name: 'Friendly', description: 'Warm and approachable' }
    ];
  }

  private setDefaultComplexity(): void {
    this.complexityLevels = [
      { code: 'simple', name: 'Simple', description: 'Easy to understand, basic vocabulary' },
      { code: 'intermediate', name: 'Intermediate', description: 'Moderate complexity, professional vocabulary' },
      { code: 'advanced', name: 'Advanced', description: 'Complex structure, sophisticated vocabulary' }
    ];
  }

  onActionTypeChange(): void {
    const actionType = this.emailForm.get('actionType')?.value;
    
    // Clear previous validators
    this.clearValidators();
    
    // Add validators based on action type
    switch (actionType) {
      case 'compose':
        this.setComposeValidators();
        break;
      case 'reply':
      case 'formalize':
        this.setReplyFormalizeValidators();
        break;
      default:
        break;
    }
    
    // Update form validity
    this.updateFormValidity();
  }

  private clearValidators(): void {
    this.emailForm.get('subject')?.clearValidators();
    this.emailForm.get('emailContent')?.clearValidators();
    this.emailForm.get('recipientName')?.clearValidators();
  }

  private setComposeValidators(): void {
    this.emailForm.get('subject')?.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]);
  }

  private setReplyFormalizeValidators(): void {
    this.emailForm.get('emailContent')?.setValidators([
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(5000)
    ]);
  }

  private updateFormValidity(): void {
    this.emailForm.get('subject')?.updateValueAndValidity();
    this.emailForm.get('emailContent')?.updateValueAndValidity();
    this.emailForm.get('recipientName')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.startEmailGeneration();

    const request: EmailRequest = this.prepareRequest();

    this.emailService.generateEmail(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleGenerationSuccess(response),
        error: (error) => this.handleGenerationError(error)
      });
  }

  private validateForm(): boolean {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched();
      this.toastService.error('❌ Please fill in all required fields correctly');
      return false;
    }

    if (this.isLoading) {
      this.toastService.warning('⏳ Please wait for the current request to complete');
      return false;
    }

    return true;
  }

  private startEmailGeneration(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showResult = false;
    this.copySuccess = false;
  }

  private prepareRequest(): EmailRequest {
    const formValue = this.emailForm.value;
    
    return {
      actionType: formValue.actionType,
      recipientName: formValue.recipientName?.trim() || undefined,
      subject: formValue.subject?.trim() || undefined,
      emailContent: formValue.emailContent?.trim() || undefined,
      keywords: formValue.keywords?.trim() || undefined,
      tone: formValue.tone,
      language: formValue.language,
      complexity: formValue.complexity
    };
  }

  private handleGenerationSuccess(response: any): void {
    this.isLoading = false;
    
    if (response.success && response.data) {
      this.generatedEmail = response.data.generatedEmail;
      this.showResult = true;
      this.toastService.success('🎉 Email generated successfully!');
      this.scrollToResult();
    } else {
      this.errorMessage = response.message || 'Failed to generate email';
      this.toastService.error('❌ Failed to generate email');
    }
  }

  private handleGenerationError(error: any): void {
    this.isLoading = false;
    
    const errorMessage = this.getErrorMessage(error);
    this.errorMessage = errorMessage;
    this.toastService.error(`❌ ${errorMessage}`);
    
    console.error('Email generation error:', error);
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error?.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    } else if (error?.status >= 500) {
      return 'Server error occurred. Please try again later.';
    } else if (error?.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    } else {
      return 'Failed to connect to the server. Please try again.';
    }
  }

  private scrollToResult(): void {
    setTimeout(() => {
      const resultElement = document.querySelector('.result-section');
      if (resultElement) {
        resultElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }

  async copyToClipboard(): Promise<void> {
    if (!this.generatedEmail) {
      this.toastService.error('❌ No email content to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.generatedEmail);
      this.copySuccess = true;
      this.toastService.success('✅ Email copied to clipboard!');
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(this.generatedEmail);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        this.copySuccess = true;
        this.toastService.success('✅ Email copied to clipboard!');
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      } else {
        throw new Error('Fallback copy failed');
      }
    } catch (err) {
      this.toastService.error('❌ Failed to copy to clipboard. Please copy manually.');
      console.error('Failed to copy to clipboard:', err);
    }
  }

  clearResult(): void {
    this.showResult = false;
    this.generatedEmail = '';
    this.errorMessage = '';
    this.copySuccess = false;
  }

  resetForm(): void {
    this.clearResult();
    this.emailForm.reset({
      actionType: 'compose',
      tone: 'formal',
      language: 'english',
      complexity: 'simple'
    });
    this.onActionTypeChange();
    this.toastService.info('📝 Form reset');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.emailForm.controls).forEach(key => {
      const control = this.emailForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  get actionType() { return this.emailForm.get('actionType'); }
  get recipientName() { return this.emailForm.get('recipientName'); }
  get subject() { return this.emailForm.get('subject'); }
  get emailContent() { return this.emailForm.get('emailContent'); }
  get keywords() { return this.emailForm.get('keywords'); }
  get tone() { return this.emailForm.get('tone'); }
  get language() { return this.emailForm.get('language'); }
  get complexity() { return this.emailForm.get('complexity'); }

  // FIXED: Select value helper method
  hasSelectValue(controlName: string): boolean {
    const control = this.emailForm.get(controlName);
    return !!(control?.value && control.value !== '' && control.value !== null);
  }

  // Validation helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.emailForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

    getFieldError(fieldName: string): string {
    const field = this.emailForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'subject': 'Subject',
      'emailContent': 'Email content',
      'recipientName': 'Recipient name',
      'keywords': 'Keywords',
      'tone': 'Tone',
      'language': 'Language',
      'complexity': 'Complexity'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Character count helpers for template
  getCharacterCount(fieldName: string): number {
    const field = this.emailForm.get(fieldName);
    return field?.value?.length || 0;
  }

  getMaxCharacters(fieldName: string): number {
    const maxLengths: { [key: string]: number } = {
      'subject': 100,
      'emailContent': 5000,
      'keywords': 200
    };
    return maxLengths[fieldName] || 0;
  }

  // Progress indicator for character limits
  getCharacterProgress(fieldName: string): number {
    const current = this.getCharacterCount(fieldName);
    const max = this.getMaxCharacters(fieldName);
    return max > 0 ? (current / max) * 100 : 0;
  }

  isCharacterLimitNearMax(fieldName: string): boolean {
    return this.getCharacterProgress(fieldName) > 80;
  }

  isCharacterLimitExceeded(fieldName: string): boolean {
    return this.getCharacterProgress(fieldName) > 100;
  }

  // Action type helpers
  getCurrentActionTypeConfig() {
    const currentActionType = this.actionType?.value;
    return this.actionTypes.find(action => action.code === currentActionType);
  }

  isComposeAction(): boolean {
    return this.actionType?.value === 'compose';
  }

  isReplyAction(): boolean {
    return this.actionType?.value === 'reply';
  }

  isFormalizeAction(): boolean {
    return this.actionType?.value === 'formalize';
  }

  // Form state helpers
  isFieldRequired(fieldName: string): boolean {
    const field = this.emailForm.get(fieldName);
    return field?.hasError('required') || false;
  }

  canSubmitForm(): boolean {
    return this.isFormValid && !this.isLoading;
  }

  // Content helpers
  hasGeneratedContent(): boolean {
    return this.showResult && this.generatedEmail.length > 0;
  }

  getEstimatedReadTime(): string {
    if (!this.generatedEmail) return '0 min';
    const wordsPerMinute = 200;
    const wordCount = this.generatedEmail.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  }

  getWordCount(): number {
    if (!this.generatedEmail) return 0;
    return this.generatedEmail.trim().split(/\s+/).length;
  }

  // Utility methods
  preventDefault(event: Event): void {
    event.preventDefault();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.canSubmitForm()) {
        this.onSubmit();
      }
    }

    // Escape to clear result
    if (event.key === 'Escape' && this.showResult) {
      event.preventDefault();
      this.clearResult();
    }

    // Ctrl/Cmd + R to reset form
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.resetForm();
    }
  }

  // Analytics/tracking methods (for future use)
  trackFormSubmission(actionType: string): void {
    // Placeholder for analytics tracking
    console.log(`Form submitted with action: ${actionType}`);
  }

  trackCopyAction(): void {
    // Placeholder for analytics tracking
    console.log('Email content copied to clipboard');
  }

  trackFormReset(): void {
    // Placeholder for analytics tracking
    console.log('Form reset by user');
  }

  // Performance optimization
  trackByActionType(index: number, item: any): string {
    return item.code;
  }

  trackByOptionCode(index: number, item: SupportedOption): string {
    return item.code;
  }

  getToneDisplay(): string {
    const toneCode = this.emailForm.get('tone')?.value;
    const tone = this.tones.find(t => t.code === toneCode);
    return tone ? tone.name : 'Professional';
  }
}
