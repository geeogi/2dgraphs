import moment from "moment";
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  DARK_BACKGROUND_COLOR,
  DARK_BORDER_COLOR,
  DARK_CONTRAST_COLOR,
  PRIMARY_BASE,
  PRIMARY_COLOR
} from "../../../Config/colors";
import {
  ACTIVE_LEGEND,
  GRAPH_MARGIN_X,
  GRAPH_MARGIN_Y,
  LABEL_MARGIN_X,
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
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}

export const getPeriodAverageRenderMethod = (props: Props) => {
  const { earliestDate, latestDate, maxPrice, minPrice, values } = props;

  // Get x-axis labels
  const xConfig = getDateLabels(earliestDate, latestDate, 4);
  const { dateLabels: xLabels, displayFormat: xDisplayFormat } = xConfig;

  // Get y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels: yLabels } = yConfig;

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
    const context = canvasElement.getContext("2d");

    // Calculate graph dimensions
    const graphDepth = height - 2 * GRAPH_MARGIN_Y;
    const graphWidth = width - 2 * GRAPH_MARGIN_X;

    // Utils to convert from graph coordinates to canvas pixels
    const toCanvasY = (graphY: number) => GRAPH_MARGIN_Y + graphDepth - graphY;
    const toCanvasX = (graphX: number) => GRAPH_MARGIN_X + graphX;

    // Get canvas util methods
    const scaleRetina = getRetinaMethod(context, canvasElement, width, height);
    const getGradient = getGradientMethod(context, GRAPH_MARGIN_Y, graphDepth);

    // Get x-axis scale helpers
    const unixMin = dateToUnix(earliestDate);
    const unixMax = dateToUnix(latestDate);
    const scaleUnixX = getScaleMethod(unixMin, unixMax, 0, graphWidth);
    const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

    // Get y-axis scale helpers
    const scalePriceY = getScaleMethod(yLabels[0], maxPrice, 0, graphDepth);

    // Calculate primary line points (price vs. date)
    const points = values.map(value => {
      const graphX = scaleDateX(value.dateTime);
      const graphY = scalePriceY(value.price);
      return { canvasX: toCanvasX(graphX), canvasY: toCanvasY(graphY), value };
    });

    // Scale retina
    scaleRetina();

    // Draw x-axis
    drawXAxes(
      context,
      xLabels,
      unix => toCanvasX(scaleDateX(unix)),
      unix => moment(unix).format(xDisplayFormat),
      graphWidth,
      graphDepth
    );

    // Draw y-axis
    drawYAxes(
      context,
      yLabels,
      price => toCanvasY(scalePriceY(price)),
      price => `$${Math.round(price)}`,
      graphWidth
    );

    // Draw primary block
    fillPath(
      context,
      [
        { canvasX: toCanvasX(0), canvasY: toCanvasY(0) },
        ...points,
        {
          canvasX: toCanvasX(graphWidth),
          canvasY: toCanvasY(0)
        }
      ],
      getGradient(PRIMARY_BASE(0.4), PRIMARY_BASE(0))
    );

    // Draw primary line
    drawLine(context, points, PRIMARY_COLOR);

    // Draw active legend, if active
    if (activeX && activeY) {
      // Fetch nearest point to active coordinates
      const [{ canvasX, canvasY, value }] = points.sort((a, b) => {
        return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
      });

      // Draw dashed active line
      drawLine(
        context,
        [
          { canvasX, canvasY: toCanvasY(graphDepth) },
          { canvasX, canvasY: toCanvasY(0) }
        ],
        BORDER_COLOR,
        2,
        [5, 5]
      );

      // Draw active legend body
      context.strokeStyle = DARK_BORDER_COLOR;
      context.fillStyle = DARK_BACKGROUND_COLOR;
      context.beginPath();

      const legendTopY = toCanvasY(graphDepth - 2 * SPACING_UNIT);
      const legendBottomY = toCanvasY(graphDepth - 5 * SPACING_UNIT);

      const anchorY = canvasY < legendBottomY ? canvasY - SPACING_UNIT : 0;
      const anchorX = clamp(canvasX, LABEL_MARGIN_X, width - LABEL_MARGIN_X);

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
      context.stroke();
      context.fill();

      // Draw active legend circular handle
      context.fillStyle = PRIMARY_COLOR;
      context.strokeStyle = BACKGROUND_COLOR;
      context.beginPath();
      context.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
      context.fill();
      context.stroke();

      // Draw active legend text
      context.fillStyle = DARK_CONTRAST_COLOR;
      context.textAlign = "center";
      const priceLabel = Math.round(value.price);
      const dateLabel = moment(value.dateTime).format("DD MMM YY");
      const label = `$${priceLabel}    ${dateLabel}`;
      context.fillText(label, anchorX, anchorY + legendBottomY - SPACING_UNIT);
    }
  };
};
