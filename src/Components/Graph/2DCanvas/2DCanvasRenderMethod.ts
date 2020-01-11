import moment from "moment";
import {
  ACTIVE_HANDLE_BODY_RGB,
  ACTIVE_HANDLE_BORDER_RGB,
  ACTIVE_LEGEND_BACKGROUND_RGB,
  ACTIVE_LEGEND_TEXT_RGB,
  ACTIVE_LINE_RGB,
  PRIMARY_COLOR_ALPHA_RGB,
  PRIMARY_COLOR_RGB
} from "../../../Config/colors";
import {
  ACTIVE_LEGEND,
  GRAPH_MARGIN_X,
  GRAPH_MARGIN_Y,
  SPACING_UNIT
} from "../constants";
import { dateToUnix, getDateLabels, getPriceLabels } from "../labelUtils";
import { clamp, getScaleMethod } from "../numberUtils";
import { drawXAxes, drawYAxes } from "./2DCanvasUtils/axesUtils";
import { getRetinaMethod } from "./2DCanvasUtils/canvasUtils";
import { getParentDimensions } from "./2DCanvasUtils/domUtils";
import {
  drawLine,
  fillPath,
  getGradientMethod
} from "./2DCanvasUtils/drawUtils";

interface Props {
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}

export const getPeriodAverageRenderMethod = (props: Props) => {
  const { earliestDate, latestDate, maxPrice, minPrice, values } = props;

  // Get x-axis labels
  const xLabels = getDateLabels(earliestDate, latestDate, 4);

  // Get y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels: yLabels } = yConfig;

  // Get x-axis scale helpers
  const unixMin = dateToUnix(earliestDate);
  const unixMax = dateToUnix(latestDate);
  const scaleUnixX = getScaleMethod(unixMin, unixMax, 0, 1);
  const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

  // Get y-axis scale helpers
  const scalePriceY = getScaleMethod(yLabels[0], maxPrice, 0, 1);

  // Calculate primary line points (price vs. date)
  const points = values.map(value => {
    const graphX = scaleDateX(value.dateTime);
    const graphY = scalePriceY(value.price);
    return { x: graphX, y: graphY, value };
  });

  /* RETURN 2D CANVAS RENDER FUNCTION */
  return function render(renderVariables?: {
    canvasElement?: HTMLCanvasElement;
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) {
    // Extract render variables
    const { canvasElement, activeX, activeY } = renderVariables as any;

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
      canvasX: toCanvasX(point.x * graphWidth),
      canvasY: toCanvasY(point.y * graphDepth),
      value: point.value
    }));

    // Scale retina
    scaleRetina();

    // Draw x-axis
    drawXAxes(
      context,
      xLabels,
      unix => toCanvasX(scaleDateX(unix) * graphWidth),
      graphWidth,
      graphDepth
    );

    // Draw y-axis
    drawYAxes(
      context,
      yLabels,
      price => toCanvasY(scalePriceY(price) * graphDepth),
      price => `$${Math.round(price)}`,
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

    // Draw active legend, if active
    if (activeX && activeY) {
      // Fetch nearest point to active coordinates
      const [{ canvasX, canvasY, value }] = scaledPoints.sort((a, b) => {
        return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
      });

      // Draw active line
      drawLine(
        context,
        [
          { canvasX, canvasY: toCanvasY(graphDepth) },
          { canvasX, canvasY: toCanvasY(0) }
        ],
        ACTIVE_LINE_RGB,
        1
      );

      // Draw active legend body
      context.fillStyle = ACTIVE_LEGEND_BACKGROUND_RGB;
      context.beginPath();

      const legendTopY = toCanvasY(graphDepth - 2 * SPACING_UNIT);
      const legendBottomY = toCanvasY(graphDepth - 5 * SPACING_UNIT);

      const anchorY = canvasY < legendBottomY ? canvasY - SPACING_UNIT : 0;
      const anchorX = clamp(
        canvasX,
        ACTIVE_LEGEND.WIDTH / 2,
        width - ACTIVE_LEGEND.WIDTH / 2
      );

      context.moveTo(anchorX - ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
      context.lineTo(anchorX - ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
      context.lineTo(
        anchorX - ACTIVE_LEGEND.WIDTH / 2,
        anchorY + legendBottomY
      );
      context.lineTo(
        anchorX + ACTIVE_LEGEND.WIDTH / 2,
        anchorY + legendBottomY
      );
      context.lineTo(anchorX + ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
      context.fill();

      // Draw active legend circular handle
      context.fillStyle = ACTIVE_HANDLE_BODY_RGB;
      context.strokeStyle = ACTIVE_HANDLE_BORDER_RGB;
      context.beginPath();
      context.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
      context.fill();
      context.stroke();

      // Draw active legend text
      context.fillStyle = ACTIVE_LEGEND_TEXT_RGB;
      context.textAlign = "center";
      const priceLabel = Math.round(value.price);
      const dateLabel = moment(value.dateTime).format("DD MMM YY");
      const label = `$${priceLabel} – ${dateLabel}`;
      context.fillText(label, anchorX, anchorY + legendBottomY - SPACING_UNIT);
    }
  };
};
