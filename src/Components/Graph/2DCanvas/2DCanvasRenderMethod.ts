import {
  ACTIVE_HANDLE_BODY_RGB,
  ACTIVE_HANDLE_BORDER_RGB,
  ACTIVE_LINE_RGB,
  PRIMARY_COLOR_ALPHA_RGB,
  PRIMARY_COLOR_RGB
} from "../../../Config/colors";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../Universal/constants";
import { drawXAxes, drawYAxes } from "./2DCanvasUtils/axesUtils";
import { getRetinaMethod } from "./2DCanvasUtils/canvasUtils";
import { getParentDimensions } from "./2DCanvasUtils/domUtils";
import {
  drawLine,
  fillPath,
  getGradientMethod
} from "./2DCanvasUtils/drawUtils";

interface Props {
  points: {
    x: number;
    y: number;
    price: any;
    dateTime: any;
  }[];
  xGridLines: number[];
  yGridLines: number[];
  positionActiveLegend: (
    canvas: HTMLCanvasElement,
    activeX: number | undefined
  ) => void;
}

export const getPeriodAverageRenderMethod = (props: Props) => {
  const { points, xGridLines, yGridLines, positionActiveLegend } = props;

  /* RETURN 2D CANVAS RENDER FUNCTION */
  return function render(renderVariables?: {
    canvasElement?: HTMLCanvasElement;
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) {
    // Extract render variables
    const { canvasElement, activeX } = renderVariables as any;

    // Fetch the desired canvas height and width
    const { height, width } = getParentDimensions(canvasElement);

    // Fetch the canvas context
    const context: CanvasRenderingContext2D = canvasElement.getContext("2d");

    // Clear graph
    context.clearRect(0, 0, width, height);

    // Calculate graph dimensions
    const graphDepth = height - 2 * GRAPH_MARGIN_Y;
    const graphWidth = width - 2 * GRAPH_MARGIN_X;

    // Utils to convert from graph coordinates to canvas pixels
    const toCanvasY = (graphY: number) => GRAPH_MARGIN_Y + graphDepth - graphY;
    const toCanvasX = (graphX: number) => GRAPH_MARGIN_X + graphX;

    // Get canvas util methods
    const scaleRetina = getRetinaMethod(context, canvasElement, width, height);
    const getGradient = getGradientMethod(
      context,
      GRAPH_MARGIN_Y,
      GRAPH_MARGIN_Y + graphDepth
    );

    // Scale points to screen resolution
    const scaledPoints = points.map(point => ({
      canvasX: toCanvasX(((point.x + 1) / 2) * graphWidth),
      canvasY: toCanvasY(((point.y + 1) / 2) * graphDepth),
      dateTime: point.dateTime,
      price: point.price
    }));

    // Scale retina
    scaleRetina();

    // Draw x-axis
    drawXAxes(
      context,
      xGridLines,
      clipSpace => toCanvasX(((clipSpace + 1) / 2) * graphWidth),
      graphWidth,
      graphDepth
    );

    // Draw y-axis
    drawYAxes(
      context,
      yGridLines,
      clipSpace => toCanvasY(((clipSpace + 1) / 2) * graphDepth),
      graphWidth
    );

    // Draw primary block
    fillPath(
      context,
      [
        { canvasX: toCanvasX(0), canvasY: toCanvasY(0) },
        ...scaledPoints,
        {
          canvasX: toCanvasX(graphWidth),
          canvasY: toCanvasY(0)
        }
      ],
      getGradient(PRIMARY_COLOR_ALPHA_RGB(0.6), PRIMARY_COLOR_ALPHA_RGB(0))
    );

    // Draw primary line
    drawLine(context, scaledPoints, PRIMARY_COLOR_RGB);

    // Position active legend
    positionActiveLegend(canvasElement, activeX);

    // Draw active line
    if (typeof activeX === "number") {
      // Fetch nearest point to active coordinates
      const [{ canvasX, canvasY }] = scaledPoints.sort((a, b) => {
        return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
      });

      // Draw line
      drawLine(
        context,
        [
          { canvasX, canvasY: toCanvasY(graphDepth) },
          { canvasX, canvasY: toCanvasY(0) }
        ],
        ACTIVE_LINE_RGB,
        1
      );

      // Draw legend circular handle
      context.fillStyle = ACTIVE_HANDLE_BODY_RGB;
      context.strokeStyle = ACTIVE_HANDLE_BORDER_RGB;
      context.beginPath();
      context.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    }
  };
};
