import { AXIS_COLOR_RGB, CONTRAST_COLOR } from "../../../../Config/colors";
import {
  GRAPH_MARGIN_X,
  GRAPH_MARGIN_Y,
  LABEL_MARGIN_X,
  SPACING_UNIT
} from "../../constants";

export const drawXAxes = (
  context: CanvasRenderingContext2D,
  gridLines: number[],
  toCanvasX: (...args: any) => number,

  graphWidth: number,
  graphDepth: number
) => {
  context.strokeStyle = AXIS_COLOR_RGB;
  context.fillStyle = CONTRAST_COLOR;
  context.beginPath();

  gridLines.forEach(label => {
    const labelX = toCanvasX(label);
    if (labelX > LABEL_MARGIN_X && labelX < graphWidth - LABEL_MARGIN_X) {
      context.moveTo(labelX, GRAPH_MARGIN_Y + graphDepth);
      context.lineTo(labelX, GRAPH_MARGIN_Y + graphDepth + SPACING_UNIT);
    }
  });

  context.stroke();
};

export const drawYAxes = (
  context: CanvasRenderingContext2D,
  gridLines: number[],
  toCanvasX: (...args: any) => number,
  graphWidth: number
) => {
  context.strokeStyle = AXIS_COLOR_RGB;
  context.beginPath();

  gridLines.forEach(price => {
    const labelY = toCanvasX(price);
    context.moveTo(GRAPH_MARGIN_X, labelY);
    context.lineTo(GRAPH_MARGIN_X + graphWidth, labelY);
  });

  context.stroke();
};
