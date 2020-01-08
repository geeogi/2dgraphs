import styled from "styled-components";
import { BACKGROUND_COLOR, CONTRAST_COLOR } from "../Config/colors";

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

interface ActiveLegendProps {
  width: number;
}

export const ActiveLegend = styled.div<ActiveLegendProps>`
  width: ${props => `${props.width}px`};
  background: ${CONTRAST_COLOR};
  color: ${BACKGROUND_COLOR};
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 0px;
  font-size: 12px;
  text-align: center;
`;
