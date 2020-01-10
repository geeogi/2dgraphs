import { AXIS_COLOR_RGB } from "../../../../Config/colors";
import {
  GRAPH_MARGIN_Y,
  LABEL_MARGIN_X,
  SPACING_UNIT,
  GRAPH_MARGIN_X
} from "../../constants";

export const drawXAxes = (
  context: CanvasRenderingContext2D,
  labels: any[],
  toCanvasX: (...args: any) => number,
  format: (...args: any) => string,
  graphWidth: number,
  graphDepth: number
) => {
  context.textAlign = "center";
  context.font = "12px Arial";
  context.strokeStyle = AXIS_COLOR_RGB;
  context.beginPath();

  labels.forEach(label => {
    const labelX = toCanvasX(label);
    if (labelX > LABEL_MARGIN_X && labelX < graphWidth - LABEL_MARGIN_X) {
      const labelY = GRAPH_MARGIN_Y + graphDepth + SPACING_UNIT * 3;
      context.fillText(format(label), labelX, labelY);
      context.moveTo(labelX, GRAPH_MARGIN_Y + graphDepth);
      context.lineTo(labelX, GRAPH_MARGIN_Y + graphDepth + SPACING_UNIT);
    }
  });

  context.stroke();
};

export const drawYAxes = (
  context: CanvasRenderingContext2D,
  labels: any[],
  toCanvasX: (...args: any) => number,
  format: (...args: any) => string,
  graphWidth: number
) => {
  context.textAlign = "start";
  context.font = "12px Arial";
  context.strokeStyle = AXIS_COLOR_RGB;
  context.beginPath();

  labels.forEach(price => {
    const labelX = LABEL_MARGIN_X;
    const labelY = toCanvasX(price);
    context.fillText(format(price), labelX, labelY - SPACING_UNIT);
    context.moveTo(GRAPH_MARGIN_X, labelY);
    context.lineTo(graphWidth, labelY);
  });

  context.stroke();
};
