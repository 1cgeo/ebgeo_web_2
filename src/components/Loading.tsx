import { PropagateLoader } from "react-spinners";
import styled from "styled-components";

const Background = styled("div")({
  backgroundColor: "#508D4E",
  height: "100%",
  width: "100%",
  left: 0,
  top: 0,
  position: "absolute",
});

export default function Loading() {
  return (
    <Background>
      <PropagateLoader
        color={"#B4E380"}
        cssOverride={{
          position: "absolute",
          top: "50%",
          left: "50%",
        }}
      />
    </Background>
  );
}
