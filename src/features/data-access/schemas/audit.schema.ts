// Path: features\data-access\schemas\audit.schema.ts

import { z } from 'zod';

// Schema para campos de auditoria
export const AuditFieldsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  ownerId: z.string().optional(),
});

// Tipo inferido do schema
export type AuditFields = z.infer<typeof AuditFieldsSchema>;

// Função para criar campos de auditoria
export const createAuditFields = (ownerId?: string): AuditFields => {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    updatedAt: now,
    ownerId,
  };
};

// Função para atualizar campos de auditoria
export const updateAuditFields = (existingFields: AuditFields, ownerId?: string): AuditFields => {
  return {
    ...existingFields,
    updatedAt: new Date().toISOString(),
    ownerId: ownerId || existingFields.ownerId,
  };
};
