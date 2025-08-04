// Path: features\io\components\NotificationSystem.tsx

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Error as AlertCircle,
  Info,
  Close as X,
  Download,
  Upload,
  Schedule as Clock,
} from '@mui/icons-material';

// Placeholder para formatters até corrigir arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Tipos de notificação
type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'progress';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number | null; // em ms, null para persistente
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
  progress?: number; // 0-100 para notificações de progresso
  icon?: React.ReactNode;
  timestamp: number;
}

// Store para notificações
interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
}

// Placeholders para stores até implementar
const useIOSelectors = () => ({
  lastExportResult: null,
});

const useIOStore = () => ({
  // Simular getState que retorna o estado atual
  exportOperation: {
    status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
    progress: 0,
    currentPhase: '',
    result: null,
    error: null,
  },
  importOperation: {
    status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
    progress: 0,
    currentPhase: '',
    result: null,
    error: null,
  },
  setShowResultModal: (show: boolean, type?: 'export' | 'import') => {
    console.log('Show result modal:', show, type);
  },
});

// Hook para gerenciar notificações
export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    maxNotifications: 5,
  });

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? (notification.type === 'error' ? null : 5000),
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications.slice(0, prev.maxNotifications - 1)],
    }));

    // Auto-remove se tiver duração
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  };

  const clearAllNotifications = () => {
    setState(prev => ({
      ...prev,
      notifications: [],
    }));
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, ...updates } : n)),
    }));
  };

  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,
  };
};

// Hook para notificações de I/O
export const useIONotifications = () => {
  const ioStore = useIOStore();
  const { addNotification, updateNotification, removeNotification } = useNotifications();

  // IDs das notificações ativas
  const [activeNotifications, setActiveNotifications] = useState<{
    export?: string;
    import?: string;
  }>({});

  // Monitorar operações de export
  useEffect(() => {
    const exportOp = ioStore.exportOperation;

    if (exportOp.status === 'loading' && !activeNotifications.export) {
      // Iniciar notificação de progresso para export
      const id = addNotification({
        type: 'progress',
        title: 'Exportando dados',
        message: exportOp.currentPhase || 'Preparando exportação...',
        progress: exportOp.progress,
        duration: null, // Persistente até completar
        icon: <Download className="w-4 h-4" />,
      });

      setActiveNotifications(prev => ({ ...prev, export: id }));
    } else if (exportOp.status === 'success' && activeNotifications.export) {
      // Completar export
      removeNotification(activeNotifications.export);

      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: `Arquivo exportado com sucesso`,
        icon: <CheckCircle className="w-4 h-4" />,
        actions: [
          {
            label: 'Ver detalhes',
            action: () => ioStore.setShowResultModal(true, 'export'),
            style: 'secondary',
          },
        ],
      });

      setActiveNotifications(prev => ({ ...prev, export: undefined }));
    } else if (exportOp.status === 'error' && activeNotifications.export) {
      // Erro no export
      removeNotification(activeNotifications.export);

      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: exportOp.error || 'Erro desconhecido durante a exportação',
        icon: <AlertCircle className="w-4 h-4" />,
        actions: [
          {
            label: 'Tentar novamente',
            action: () => {
              console.log('Tentar exportação novamente');
            },
            style: 'primary',
          },
        ],
      });

      setActiveNotifications(prev => ({ ...prev, export: undefined }));
    }

    // Atualizar progresso se notificação ativa
    if (exportOp.status === 'loading' && activeNotifications.export) {
      updateNotification(activeNotifications.export, {
        message: exportOp.currentPhase || 'Exportando...',
        progress: exportOp.progress,
      });
    }
  }, [ioStore.exportOperation, activeNotifications.export, addNotification, updateNotification, removeNotification, ioStore]);

  // Monitorar operações de import
  useEffect(() => {
    const importOp = ioStore.importOperation;

    if (importOp.status === 'loading' && !activeNotifications.import) {
      // Iniciar notificação de progresso para import
      const id = addNotification({
        type: 'progress',
        title: 'Importando dados',
        message: importOp.currentPhase || 'Preparando importação...',
        progress: importOp.progress,
        duration: null,
        icon: <Upload className="w-4 h-4" />,
      });

      setActiveNotifications(prev => ({ ...prev, import: id }));
    } else if (importOp.status === 'success' && activeNotifications.import) {
      // Completar import
      removeNotification(activeNotifications.import);

      const result = importOp.result;
      const conflicts = result?.conflicts?.length || 0;
      const errors = result?.errors?.length || 0;

      addNotification({
        type: conflicts > 0 || errors > 0 ? 'warning' : 'success',
        title: 'Importação concluída',
        message: `Dados importados com sucesso${conflicts > 0 ? ` (${conflicts} conflitos)` : ''}`,
        icon: <CheckCircle className="w-4 h-4" />,
        actions: [
          {
            label: 'Ver detalhes',
            action: () => ioStore.setShowResultModal(true, 'import'),
            style: 'secondary',
          },
        ],
      });

      setActiveNotifications(prev => ({ ...prev, import: undefined }));
    } else if (importOp.status === 'error' && activeNotifications.import) {
      // Erro no import
      removeNotification(activeNotifications.import);

      addNotification({
        type: 'error',
        title: 'Erro na importação',
        message: importOp.error || 'Erro desconhecido durante a importação',
        icon: <AlertCircle className="w-4 h-4" />,
        actions: [
          {
            label: 'Tentar novamente',
            action: () => {
              console.log('Tentar importação novamente');
            },
            style: 'primary',
          },
        ],
      });

      setActiveNotifications(prev => ({ ...prev, import: undefined }));
    }

    // Atualizar progresso se notificação ativa
    if (importOp.status === 'loading' && activeNotifications.import) {
      updateNotification(activeNotifications.import, {
        message: importOp.currentPhase || 'Importando...',
        progress: importOp.progress,
      });
    }
  }, [ioStore.importOperation, activeNotifications.import, addNotification, updateNotification, removeNotification, ioStore]);

  return {
    // Métodos para criar notificações específicas de I/O
    notifyExportStarted: (filename?: string) => {
      return addNotification({
        type: 'info',
        title: 'Iniciando exportação',
        message: filename ? `Exportando para ${filename}` : 'Preparando dados para exportação',
        icon: <Download className="w-4 h-4" />,
      });
    },

    notifyImportStarted: (filename: string) => {
      return addNotification({
        type: 'info',
        title: 'Iniciando importação',
        message: `Importando arquivo ${filename}`,
        icon: <Upload className="w-4 h-4" />,
      });
    },

    notifyValidationIssues: (issues: string[]) => {
      return addNotification({
        type: 'warning',
        title: 'Problemas de validação',
        message: `${issues.length} problema(s) encontrado(s)`,
        icon: <AlertCircle className="w-4 h-4" />,
        actions: [
          {
            label: 'Ver detalhes',
            action: () => {
              console.log('Problemas de validação:', issues);
            },
            style: 'secondary',
          },
        ],
      });
    },

    notifyBackupCreated: (backupId: string) => {
      return addNotification({
        type: 'info',
        title: 'Backup criado',
        message: 'Backup automático criado antes da importação',
        icon: <Clock className="w-4 h-4" />,
      });
    },
  };
};

// Componente de notificação individual
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: () => void;
}> = ({ notification, onRemove }) => {
  const getIcon = () => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 20, color: 'green' }} />;
      case 'error':
        return <AlertCircle sx={{ fontSize: 20, color: 'red' }} />;
      case 'warning':
        return <AlertCircle sx={{ fontSize: 20, color: 'orange' }} />;
      case 'info':
      case 'progress':
        return <Info sx={{ fontSize: 20, color: 'blue' }} />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      case 'progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border shadow-sm ${getBgColor()}`}
         style={{ 
           backgroundColor: notification.type === 'success' ? '#f0f9ff' : 
                          notification.type === 'error' ? '#fef2f2' :
                          notification.type === 'warning' ? '#fffbeb' : '#f8fafc',
           borderColor: notification.type === 'success' ? '#bfdbfe' :
                       notification.type === 'error' ? '#fecaca' :
                       notification.type === 'warning' ? '#fed7aa' : '#cbd5e1'
         }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
            <button
              onClick={onRemove}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              style={{ padding: '4px', cursor: 'pointer' }}
            >
              <X sx={{ fontSize: 16 }} />
            </button>
          </div>

          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

          {/* Barra de progresso */}
          {notification.type === 'progress' && typeof notification.progress === 'number' && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{Math.round(notification.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${notification.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ações */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    action.style === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal do sistema de notificações
export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      style={{ 
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1300,
        maxWidth: '384px',
        width: '100%'
      }}
    >
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}

      {/* Botão para limpar todas */}
      {notifications.length > 1 && (
        <div className="text-center">
          <button
            onClick={clearAllNotifications}
            className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
            style={{ cursor: 'pointer' }}
          >
            Limpar todas as notificações
          </button>
        </div>
      )}
    </div>
  );
};