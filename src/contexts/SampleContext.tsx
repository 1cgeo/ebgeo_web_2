import * as React from "react";
import { createContext, useContext, FC } from "react";
import { useState } from "react";

interface Sample_Context {
  sampleValue: string;
  setSampleValue: any;
}

interface Props {
  children: React.ReactNode;
}

const SampleContext = createContext<Sample_Context>({
  sampleValue: "",
  setSampleValue: () => {},
});

const SampleProvider: FC<Props> = ({ children }) => {
  const [sampleValue, setSampleValue] = useState<string>("");

  const context = {
    sampleValue,
    setSampleValue,
  };

  return (
    <SampleContext.Provider value={context}>{children}</SampleContext.Provider>
  );
};

export default SampleProvider;

export const useSample = () => useContext(SampleContext);
