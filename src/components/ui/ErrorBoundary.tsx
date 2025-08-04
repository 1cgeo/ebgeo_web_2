// Path: components\ui\ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Atualizar state para que a próxima renderização mostre a UI de erro
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registrar o erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Aqui você poderia enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implementar envio de erro para serviço de monitoramento
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: enviar para API de logging
      console.log('Erro reportado:', errorReport);
    } else {
      console.group('🐛 Detalhes do Erro para Desenvolvimento');
      console.error('Erro:', error);
      console.error('Informações do erro:', errorInfo);
      console.error('Relatório completo:', errorReport);
      console.groupEnd();
    }
  };

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
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
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
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <BugIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />

              <Typography variant="h4" component="h1" gutterBottom color="error">
                Ops! Algo deu errado
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                A aplicação encontrou um erro inesperado. Você pode tentar recarregar a página ou
                reportar este problema.
              </Typography>
            </Box>

            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Erro da Aplicação</AlertTitle>
              <Typography variant="body2">
                ID do Erro: <code>{this.state.errorId}</code>
              </Typography>
              {this.state.error && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Mensagem:</strong> {this.state.error.message}
                </Typography>
              )}
            </Alert>

            {/* Ações */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                color="primary"
              >
                Recarregar Página
              </Button>

              <Button variant="outlined" onClick={this.handleReset}>
                Tentar Novamente
              </Button>
            </Box>

            {/* Detalhes técnicos (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <>
                <Divider sx={{ my: 3 }} />

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Detalhes Técnicos (Desenvolvimento)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={this.copyErrorToClipboard}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Copiar Detalhes
                      </Button>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Mensagem de Erro:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {this.state.error.message}
                        </Typography>
                      </Box>

                      {this.state.error.stack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Stack Trace:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              backgroundColor: 'grey.100',
                              p: 2,
                              borderRadius: 1,
                              overflow: 'auto',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              maxHeight: 200,
                            }}
                          >
                            {this.state.error.stack}
                          </Typography>
                        </Box>
                      )}

                      {this.state.errorInfo?.componentStack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Component Stack:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              backgroundColor: 'grey.100',
                              p: 2,
                              borderRadius: 1,
                              overflow: 'auto',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              maxHeight: 200,
                            }}
                          >
                            {this.state.errorInfo.componentStack}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </>
            )}

            {/* Instruções para usuário */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.main', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                <strong>O que você pode fazer:</strong>
              </Typography>
              <Typography
                variant="body2"
                color="info.contrastText"
                component="ul"
                sx={{ mt: 1, mb: 0 }}
              >
                <li>Recarregue a página para começar novamente</li>
                <li>Verifique sua conexão com a internet</li>
                <li>Tente limpar o cache do navegador</li>
                <li>Se o problema persistir, entre em contato com o suporte</li>
              </Typography>
            </Box>
          </Paper>
        </Box>
      );
    }

    // Se não há erro, renderizar filhos normalmente
    return this.props.children;
  }
}

// Hook para usar com componentes funcionais
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Erro capturado por useErrorHandler:', error, errorInfo);
    // Aqui você pode implementar lógica adicional de tratamento de erro
  };
};

// Componente funcional wrapper para casos específicos
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        p: 3,
        textAlign: 'center',
      }}
    >
      <BugIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />

      <Typography variant="h6" color="error" gutterBottom>
        Algo deu errado
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        {error.message}
      </Typography>

      <Button variant="outlined" onClick={resetError} startIcon={<RefreshIcon />}>
        Tentar Novamente
      </Button>
    </Box>
  );
};
