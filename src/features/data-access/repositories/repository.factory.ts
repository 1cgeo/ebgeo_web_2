// Path: features\data-access\repositories\repository.factory.ts

import {
  IRepositoryFactory,
  IFeatureRepository,
  ILayerRepository,
  IMapRepository,
} from './interfaces/IRepositoryInterfaces';
import { FeatureRepository } from './implementations/FeatureRepository';
import { LayerRepository } from './implementations/LayerRepository';
import { MapRepository } from './implementations/MapRepository';

export class RepositoryFactory implements IRepositoryFactory {
  private static instance: RepositoryFactory;

  private _featureRepository: IFeatureRepository | null = null;
  private _layerRepository: ILayerRepository | null = null;
  private _mapRepository: IMapRepository | null = null;

  private constructor() {}

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  feature(): IFeatureRepository {
    if (!this._featureRepository) {
      this._featureRepository = new FeatureRepository();
    }
    return this._featureRepository;
  }

  layer(): ILayerRepository {
    if (!this._layerRepository) {
      this._layerRepository = new LayerRepository();
    }
    return this._layerRepository;
  }

  map(): IMapRepository {
    if (!this._mapRepository) {
      this._mapRepository = new MapRepository();
    }
    return this._mapRepository;
  }

  reset(): void {
    this._featureRepository = null;
    this._layerRepository = null;
    this._mapRepository = null;
  }
}

export const repositories = RepositoryFactory.getInstance();
