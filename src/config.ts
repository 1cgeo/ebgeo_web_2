const config = {
    endpoints: {
      featureSearch: `${import.meta.env.VITE_API_URL}/busca`,
      featureInfo: `${import.meta.env.VITE_API_URL}/feicoes`,
      modelCatalog: `${import.meta.env.VITE_API_URL}/catalogo3d`,
      cesiumImagery: `${import.meta.env.VITE_IMAGERY_PROVIDER_URL}`,
      cesiumTerrain: `${import.meta.env.VITE_TERRAIN_PROVIDER_URL}`

    }
  };
  
export default config;