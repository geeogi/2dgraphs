import styled from "styled-components";
import { BACKGROUND_COLOR, CONTRAST_COLOR } from "../Data/colors";

export const GraphContainer = styled.div`
  max-width: 1000px;
  margin: auto;
`;

export const Graph = styled.div`
  height: 400px;
  width: 100%;
`;

export const RelativeGraphContainer = styled.div`
  position: relative;
`;

export const AxisLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 4px;
  font-size: 12px;
`;

export const ActiveLegend = styled.div`
  background: ${CONTRAST_COLOR};
  color: ${BACKGROUND_COLOR};
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 8px;
  border-radius: 8px;
`;
