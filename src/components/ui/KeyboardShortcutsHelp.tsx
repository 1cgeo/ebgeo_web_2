// Path: components/ui/KeyboardShortcutsHelp.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Mouse as MouseIcon,
  TouchApp as TouchIcon,
  Keyboard as KeyboardIcon,
  Help as HelpIcon,
  Palette as DrawingIcon,
  SelectAll as SelectionIcon,
  Navigation as NavigationIcon,
  Layers as LayersIcon,
  Settings as GeneralIcon,
} from '@mui/icons-material';

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shortcut-tabpanel-${index}`}
      aria-labelledby={`shortcut-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['drawing']));

  const { shortcuts, getShortcutsByCategory, formatShortcut } = useKeyboardShortcuts();

  // Categorias com ícones e descrições
  const categories = [
    {
      id: 'drawing',
      label: 'Desenho',
      icon: <DrawingIcon />,
      description: 'Ferramentas de desenho e criação de features',
      color: 'primary' as const,
    },
    {
      id: 'selection',
      label: 'Seleção',
      icon: <SelectionIcon />,
      description: 'Seleção e manipulação de features',
      color: 'secondary' as const,
    },
    {
      id: 'navigation',
      label: 'Navegação',
      icon: <NavigationIcon />,
      description: 'Navegação no mapa e entre contextos',
      color: 'info' as const,
    },
    {
      id: 'layers',
      label: 'Camadas',
      icon: <LayersIcon />,
      description: 'Gerenciamento de camadas',
      color: 'success' as const,
    },
    {
      id: 'general',
      label: 'Geral',
      icon: <GeneralIcon />,
      description: 'Ações gerais da aplicação',
      color: 'warning' as const,
    },
  ];

  // Dicas de mouse e toque
  const mouseGestures = [
    {
      action: 'Clique esquerdo',
      description: 'Selecionar feature ou criar ponto',
      icon: <MouseIcon />,
    },
    {
      action: 'Clique direito',
      description: 'Menu de contexto da feature',
      icon: <MouseIcon />,
    },
    {
      action: 'Arrastar',
      description: 'Mover feature ou navegar no mapa',
      icon: <MouseIcon />,
    },
    {
      action: 'Scroll',
      description: 'Zoom in/out',
      icon: <MouseIcon />,
    },
    {
      action: 'Shift + Clique',
      description: 'Seleção múltipla',
      icon: <MouseIcon />,
    },
    {
      action: 'Ctrl + Clique',
      description: 'Adicionar à seleção',
      icon: <MouseIcon />,
    },
  ];

  const handleToggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderShortcutChip = (shortcut: ReturnType<typeof formatShortcut>) => (
    <Chip
      label={shortcut}
      size="small"
      variant="outlined"
      sx={{
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        bgcolor: 'background.paper',
        borderColor: 'primary.main',
        color: 'primary.main',
      }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <KeyboardIcon color="primary" />
            <Typography variant="h6">
              Atalhos de Teclado e Gestos
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 0 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab label="Atalhos de Teclado" icon={<KeyboardIcon />} />
          <Tab label="Gestos do Mouse" icon={<MouseIcon />} />
        </Tabs>

        {/* Tab de Atalhos de Teclado */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            {categories.map((category) => {
              const categoryShortcuts = getShortcutsByCategory(category.id as any);
              const isExpanded = expandedSections.has(category.id);

              return (
                <Paper
                  key={category.id}
                  elevation={1}
                  sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: `${category.color}.50`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      '&:hover': {
                        bgcolor: `${category.color}.100`,
                      },
                    }}
                    onClick={() => handleToggleSection(category.id)}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box color={`${category.color}.main`}>
                        {category.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {category.label}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        size="small"
                        label={`${categoryShortcuts.length} atalhos`}
                        color={category.color}
                        variant="outlined"
                      />
                      {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                    </Box>
                  </Box>

                  <Collapse in={isExpanded} timeout={300}>
                    <List dense sx={{ bgcolor: 'background.paper' }}>
                      {categoryShortcuts.map((shortcut, index) => (
                        <Fade
                          key={`${shortcut.key}-${shortcut.description}`}
                          in={isExpanded}
                          timeout={300 + index * 50}
                        >
                          <ListItem
                            sx={{
                              borderTop: index > 0 ? 1 : 0,
                              borderColor: 'divider',
                              py: 1.5,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <Typography variant="body2">
                                    {shortcut.description}
                                  </Typography>
                                  {renderShortcutChip(formatShortcut(shortcut))}
                                </Box>
                              }
                            />
                          </ListItem>
                        </Fade>
                      ))}
                    </List>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        </TabPanel>

        {/* Tab de Gestos do Mouse */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gestos com Mouse
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Interações básicas para navegação e seleção no mapa
              </Typography>

              <List>
                {mouseGestures.map((gesture, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <Box color="primary.main">
                        {gesture.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2">
                            {gesture.description}
                          </Typography>
                          <Chip
                            label={gesture.action}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Dicas de Produtividade
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Use <strong>Ctrl + A</strong> para selecionar todas as features rapidamente
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Pressione <strong>Esc</strong> para cancelar qualquer operação
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Use <strong>V, P, L, O</strong> para alternar entre ferramentas rapidamente
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Shift + Click</strong> permite seleção múltipla sem usar Ctrl
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Del</strong> ou <strong>Backspace</strong> deletam features selecionadas
                </Typography>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <HelpIcon color="action" fontSize="small" />
          <Typography variant="caption" color="textSecondary">
            Pressione F1 a qualquer momento para abrir esta ajuda
          </Typography>
        </Box>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};