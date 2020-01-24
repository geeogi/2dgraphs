import { AXIS_COLOR_RGB } from "../../Config/colors";

export const SPACING_UNIT = 8;
export const GRAPH_MARGIN_Y = 4 * SPACING_UNIT;
export const GRAPH_MARGIN_X = 2 * SPACING_UNIT;
export const LABEL_MARGIN_X = 2 * SPACING_UNIT;
export const ACTIVE_LEGEND_WIDTH = 120;
export const ACTIVE_CIRCLE_WIDTH = 10;

export const AXIS_LABEL_STYLE = [
  "position: absolute",
  "pointer-events: none",
  "top: 0",
  "left: 0",
  "font-size: 12px",
  "font-family: Arial"
].join(";");

export const HORIZONTAL_GRID_LINE_STYLE = [
  `width: calc(100% - ${2 * GRAPH_MARGIN_X}px)`,
  "height: 1px",
  "margin: 0",
  `margin-left: ${GRAPH_MARGIN_X}px`,
  "position: absolute",
  "top: 0",
  "left: 0",
  "border: none",
  `background-color: ${AXIS_COLOR_RGB}`,
  `color: ${AXIS_COLOR_RGB}`
].join(";");

export const VERTICAL_GRID_LINE_STYLE = [
  "height: 8px",
  "width: 0px",
  "position: absolute",
  `bottom: ${GRAPH_MARGIN_Y - 8}`,
  "left: 0",
  `border-left: solid 1px ${AXIS_COLOR_RGB}`,
  "margin: 0"
].join(";");
