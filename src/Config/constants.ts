/**
 * Fetch CSS variables from the Document
 */

const style = getComputedStyle(document.documentElement);

export const SPACING_UNIT = parseInt(
  style.getPropertyValue("--graph-spacing-unit")
);

export const GRAPH_MARGIN_Y = parseInt(
  style.getPropertyValue("--graph-margin-y")
);

export const GRAPH_MARGIN_X = parseInt(
  style.getPropertyValue("--graph-margin-x")
);

export const LABEL_MARGIN_X = parseInt(
  style.getPropertyValue("--graph-label-margin-x")
);

export const ACTIVE_LEGEND_WIDTH = parseInt(
  style.getPropertyValue("--active-legend-width")
);

export const ACTIVE_CIRCLE_WIDTH = parseInt(
  style.getPropertyValue("--active-circle-width")
);

export const BORDER_COLOR = style.getPropertyValue("--border-color");

/**
 * Declare CSS classnames for JS constructed elements
 */

export const HORIZONTAL_GRID_LINE_CLASS = "HorizontalGridLine";

export const AXIS_LABEL_CLASS = "AxisLabel";

export const VERTICAL_GRID_LINE_CLASS = "VerticalGridLine";

/**
 * Declare HTML ID attributes for JS interacting elements
 */

export const CANVAS_2D_CANVAS_ID = "line-graph-2d-canvas";
export const CANVAS_2D_RENDER_BUTTON = "render-2d-canvas-button";

export const WEB_GL_CANVAS_ID = "line-graph-webgl";
export const WEB_GL_RENDER_BUTTON = "render-webgl-button";

export const DATA_POINTS_SLIDER = "data-points-slider";
export const DATA_POINTS_PREVIEW = "data-points-preview";
