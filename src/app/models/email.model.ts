export interface EmailRequest {
  actionType: string;
  recipientName?: string;
  subject?: string;
  emailContent?: string;
  keywords?: string;
  tone: string;
  language: string;
  complexity: string;
}

export interface EmailResponse {
  success: boolean;
  generatedEmail: string;
  errorMessage?: string;
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errorCode?: string;
  timestamp: string;
}

export interface SupportedOption {
  code: string;
  name: string;
  description?: string;
  nativeName?: string;
}