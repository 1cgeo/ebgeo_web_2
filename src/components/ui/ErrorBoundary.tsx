// Path: components\ui\ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

// Props do ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// State do ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * ErrorBoundary simplificado para capturar erros React
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Atualizar state para mostrar UI de erro
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Atualizar state com informações do erro
    this.setState({
      error,
      errorInfo,
    });

    // Chamar callback de erro se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log simples para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group('🐛 Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private copyErrorToClipboard = async () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      url: window.location.href,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      console.log('Detalhes do erro copiados para o clipboard');
    } catch (err) {
      console.error('Falha ao copiar para o clipboard:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // Se um fallback customizado foi fornecido, usá-lo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de erro padrão
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '32px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            {/* Ícone de erro */}
            <div
              style={{
                fontSize: '64px',
                marginBottom: '16px',
              }}
            >
              🐛
            </div>

            {/* Título */}
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc2626',
                marginBottom: '8px',
                margin: 0,
              }}
            >
              Ops! Algo deu errado
            </h1>

            {/* Descrição */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '24px',
                lineHeight: '1.5',
              }}
            >
              A aplicação encontrou um erro inesperado. Você pode tentar recarregar a página ou
              copiar os detalhes do erro para reportar o problema.
            </p>

            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#374151',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <strong>Error:</strong> {this.state.error.message}
                <br />
                <strong>Stack:</strong>
                <pre style={{ margin: '8px 0 0 0', fontSize: '11px' }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            {/* ID do erro */}
            <p
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginBottom: '24px',
                fontFamily: 'monospace',
              }}
            >
              ID do Erro: {this.state.errorId}
            </p>

            {/* Botões de ação */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Recarregar Página
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#6b7280';
                }}
              >
                Tentar Novamente
              </button>

              <button
                onClick={this.copyErrorToClipboard}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.color = '#4b5563';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Copiar Detalhes
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
