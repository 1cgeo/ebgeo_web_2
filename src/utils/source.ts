import config from "../config";

export const getModelUrl = (modelType: string): string | undefined => {
  return {
    "Tiles 3D": config.endpoints.models3d,
    "Modelos 3D": config.endpoints.models3d,
    "Nuvem de Pontos": config.endpoints.pointCloud,
  }[modelType];
};
