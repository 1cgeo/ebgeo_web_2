// Path: services\error.service.ts
import { ERROR_CODES } from '../constants/app.constants';

// Tipos de erro da aplicação
export type ErrorCode = keyof typeof ERROR_CODES;

// Interface para erro customizado
export interface AppError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Criar erro customizado da aplicação
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.details = details;
  error.timestamp = Date.now();
  return error;
}

/**
 * Verificar se é um erro da aplicação
 */
export function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'code' in error && 'timestamp' in error;
}

/**
 * Extrair mensagem de erro legível
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Erro desconhecido';
}

/**
 * Utilitários para tratamento de erros comuns
 */
export const ErrorUtils = {
  // Erro de validação
  validation: (message: string, details?: Record<string, any>) =>
    createAppError('VALIDATION_ERROR', message, details),

  // Erro de banco de dados
  database: (message: string, details?: Record<string, any>) =>
    createAppError('DATABASE_ERROR', message, details),

  // Erro de importação
  import: (message: string, details?: Record<string, any>) =>
    createAppError('IMPORT_ERROR', message, details),

  // Erro de exportação
  export: (message: string, details?: Record<string, any>) =>
    createAppError('EXPORT_ERROR', message, details),

  // Erro de ferramenta
  tool: (message: string, details?: Record<string, any>) =>
    createAppError('TOOL_ERROR', message, details),

  // Erro de geometria
  geometry: (message: string, details?: Record<string, any>) =>
    createAppError('GEOMETRY_ERROR', message, details),
};

/**
 * Handler simples para erros não capturados
 */
export function setupGlobalErrorHandling(): void {
  // Capturar erros JavaScript não tratados
  window.addEventListener('error', event => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro não capturado:', event.error);
    }
  });

  // Capturar promises rejeitadas não tratadas
  window.addEventListener('unhandledrejection', event => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Promise rejeitada não tratada:', event.reason);
    }
  });
}
