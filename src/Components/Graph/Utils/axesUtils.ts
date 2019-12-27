import { BORDER_COLOR } from "../../../Data/colors";
import {
  GRAPH_MARGIN_Y,
  LABEL_MARGIN_X,
  SPACING_UNIT
} from "./../PeriodAverage/constants";

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
  context.strokeStyle = BORDER_COLOR;
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
  context.textAlign = "end";
  context.font = "12px Arial";
  context.strokeStyle = BORDER_COLOR;
  context.beginPath();

  labels.forEach(price => {
    const labelX = LABEL_MARGIN_X - 1.5 * SPACING_UNIT;
    const labelY = toCanvasX(price);
    context.fillText(format(price), labelX, labelY + 3);
    context.moveTo(LABEL_MARGIN_X, labelY);
    context.lineTo(graphWidth, labelY);
  });

  context.stroke();
};