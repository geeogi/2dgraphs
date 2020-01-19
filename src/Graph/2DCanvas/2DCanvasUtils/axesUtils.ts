import { AXIS_COLOR_RGB, CONTRAST_COLOR } from "../../../Config/colors";
import { LABEL_MARGIN_X, SPACING_UNIT } from "../../Universal/constants";

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
      context.moveTo(labelX, graphDepth);
      context.lineTo(labelX, graphDepth + SPACING_UNIT);
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
    context.moveTo(0, labelY);
    context.lineTo(0 + graphWidth, labelY);
  });

  context.stroke();
};
