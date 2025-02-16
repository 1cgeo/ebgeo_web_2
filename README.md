# EBGeo

Aplicação web para visualização e análise de dados geoespaciais em 2D e 3D.

## Tecnologias Principais

- React 19 com TypeScript
- Vite para build e desenvolvimento
- MapLibre GL JS para visualização 2D
- CesiumJS para visualização 3D
- Zustand para gerenciamento de estado
- React Query para gerenciamento de dados remotos
- Zod para validação de tipos em runtime
- Material UI para interface

## Estrutura do Projeto

```
src/
  ├── map3d/           # Funcionalidades do mapa 3D
  ├── mapSig/          # Funcionalidades do mapa 2D
  └── shared/          # Componentes e utilidades compartilhadas
```

## Adicionando uma Nova Feature

O projeto segue um padrão consistente para implementação de features. Abaixo um exemplo de como adicionar uma nova feature similar ao 'identify' existente:

1. Crie a estrutura de pastas:

```
src/mapSig/features/minhaFeature/
  ├── api.ts           # Chamadas de API
  ├── store.ts         # Estado com Zustand
  ├── types.ts         # Tipos e schemas Zod
  ├── useMinhaFeature.ts    # Hook principal
  ├── MinhaFeatureControl/  # Componente de controle
  └── MinhaFeaturePanel/    # Componente de painel
```

2. Defina os tipos em `types.ts`:

```typescript
import { z } from 'zod';

export const featureSchema = z.object({
  id: z.string(),
  nome: z.string(),
  propriedades: z.record(z.unknown())
});

export type Feature = z.infer<typeof featureSchema>;
```

3. Implemente o store em `store.ts`:

```typescript
import { create } from 'zustand';
import { type Feature } from './types';

interface MinhaFeatureState {
  selectedFeature: Feature | null;
  isPanelOpen: boolean;
  setSelectedFeature: (feature: Feature | null) => void;
  openPanel: () => void;
  closePanel: () => void;
}

export const useMinhaFeatureStore = create<MinhaFeatureState>((set) => ({
  selectedFeature: null,
  isPanelOpen: false,
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
}));
```

4. Registre a feature em `mapSig/features/registry.ts`:

```typescript
import { MinhaFeatureControl } from './minhaFeature/MinhaFeatureControl';

export const features = {
  // ... outras features
  minhaFeature: {
    id: 'minhaFeature',
    name: 'Minha Feature',
    component: MinhaFeatureControl,
    order: 6,
    description: 'Descrição da feature',
  },
};
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Requisitos

- Node.js 18+
- NPM 8+