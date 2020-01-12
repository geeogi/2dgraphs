import styled from "styled-components";
import {
  ACTIVE_LEGEND_BACKGROUND_RGB,
  ACTIVE_LEGEND_TEXT_RGB
} from "../../Config/colors";

export const ACTIVE_LEGEND_WIDTH = 120;
export const ACTIVE_LEGEND_ID = "active-legend";

export const ACTIVE_CIRCLE_WIDTH = 10;
export const ACTIVE_CIRCLE_ID = "active-circle";

export const ACTIVE_LINE_ID = "active-line";

export const ActiveLegend = styled.div`
  width: ${ACTIVE_LEGEND_WIDTH}px;
  background: ${ACTIVE_LEGEND_BACKGROUND_RGB};
  color: ${ACTIVE_LEGEND_TEXT_RGB};
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 0px;
  font-size: 12px;
  text-align: center;
  z-index: 100;
`;

export const ActiveCircle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${ACTIVE_CIRCLE_WIDTH}px;
  height: ${ACTIVE_CIRCLE_WIDTH}px;
  border-radius: 50%;
  background: yellow;
  border: solid 1px black;
  z-index: 99;
`;

export const ActiveLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  border-left: 1px solid red;
  height: 100%;
  z-index: 98;
`;
