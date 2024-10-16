import { createContext, useContext, FC } from "react";
import { useState, useCallback } from "react";
import { useMapStore } from "./MapFeaturesContext";
import { SelectionContextProps, SelectionProviderProps, Feature } from "../../ts/interfaces/mapSig.interfaces";
import { FeatureType } from "../../ts/types/mapSig.types";

const SelectionContext = createContext<SelectionContextProps>({
  selectedFeatures: [],
  selectFeature: () => {},
  deselectFeature: () => {},
  clearSelection: () => {},
  moveSelectedFeatures: () => {},
});

const SelectionProvider: FC<SelectionProviderProps> = ({ children }) => {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const { updateFeature } = useMapStore();

  const selectFeature = useCallback(
    (feature: Feature, isMultiSelect: boolean) => {
      setSelectedFeatures((prev) =>
        isMultiSelect
          ? [...prev.filter((f) => f.id !== feature.id), feature]
          : [feature]
      );
    },
    []
  );

  const deselectFeature = useCallback((featureId: string) => {
    setSelectedFeatures((prev) => prev.filter((f) => f.id !== featureId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFeatures([]);
  }, []);

  const moveSelectedFeatures = useCallback(
    (dx: number, dy: number) => {
      selectedFeatures.forEach((feature) => {
        const updatedFeature = {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map((coord, index) =>
              index < 2 ? coord + (index === 0 ? dx : dy) : coord
            ),
          },
        };
        updateFeature(
          feature.properties.source as FeatureType,
          feature,
          updatedFeature
        );
      });

      setSelectedFeatures((prev) =>
        prev.map((feature) => ({
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map((coord, index) =>
              index < 2 ? coord + (index === 0 ? dx : dy) : coord
            ),
          },
        }))
      );
    },
    [selectedFeatures, updateFeature]
  );

  const context = {
    selectedFeatures,
    selectFeature,
    deselectFeature,
    clearSelection,
    moveSelectedFeatures,
  };

  return (
    <SelectionContext.Provider value={context}>
      {children}
    </SelectionContext.Provider>
  );
};

export default SelectionProvider;

export const useSelection = () => useContext(SelectionContext);
