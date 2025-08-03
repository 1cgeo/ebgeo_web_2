// Path: features\data-access\repositories\interfaces\IRepository.ts

// Interface base para todos os repositories
export interface IRepository<T, K = string> {
  // Operações básicas CRUD
  create(entity: T): Promise<T>;
  getById(id: K): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(id: K, updates: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
  
  // Operações em lote
  createMany(entities: T[]): Promise<T[]>;
  deleteMany(ids: K[]): Promise<void>;
  
  // Contagem
  count(): Promise<number>;
  
  // Verificação de existência
  exists(id: K): Promise<boolean>;
}

// Interface para operações de busca
export interface ISearchableRepository<T, K = string> extends IRepository<T, K> {
  search(query: string): Promise<T[]>;
  findBy(criteria: Partial<T>): Promise<T[]>;
}

// Interface para operações de paginação
export interface IPaginatedRepository<T, K = string> extends IRepository<T, K> {
  getPage(page: number, pageSize: number): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}

// Resultado de operação com status
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Opções para operações
export interface RepositoryOptions {
  transaction?: boolean;
  validate?: boolean;
}