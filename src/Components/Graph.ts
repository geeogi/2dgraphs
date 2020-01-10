import styled from "styled-components";
import {
  ACTIVE_LEGEND_BACKGROUND_RGB,
  ACTIVE_LEGEND_TEXT_RGB
} from "../Config/colors";

export const GraphCard = styled.div`
  max-width: 1000px;
  margin: auto;
`;

export const AxisLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  font-size: 12px;
`;

interface ActiveLegendProps {
  width: number;
}

export const ActiveLegend = styled.div<ActiveLegendProps>`
  width: ${props => `${props.width}px`};
  background: ${ACTIVE_LEGEND_BACKGROUND_RGB};
  color: ${ACTIVE_LEGEND_TEXT_RGB};
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 0px;
  font-size: 12px;
  text-align: center;
`;
