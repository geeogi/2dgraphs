import moment from "moment";
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  DARK_BACKGROUND_COLOR,
  DARK_BORDER_COLOR,
  DARK_CONTRAST_COLOR,
  PRIMARY_BASE,
  PRIMARY_COLOR,
  SECONDARY_BASE
} from "../../../Data/colors";
import { ACTIVE_LEGEND, SPACING_UNIT } from "../PeriodAverage/constants";
import { getRetinaMethod } from "../Utils/canvasUtils";
import { getParentDimensions } from "../Utils/domUtils";
import {
  clipPath,
  drawLine,
  fillPath,
  getGradientMethod
} from "../Utils/drawUtils";
import { dateToUnix, getDateLabels, getPriceLabels } from "../Utils/labelUtils";
import { clamp, getScaleMethods } from "../Utils/numberUtils";
import { drawXAxes, drawYAxes } from "./../Utils/axesUtils";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y, LABEL_MARGIN_X } from "./constants";

interface Props {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}

export const getPeriodAverageRenderMethod = (props: Props) => {
  const {
    averagePrice,
    earliestDate,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

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
    const {
      canvasElement,
      activeX,
      activeY,
      isClicked
    } = renderVariables as any;

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
    const setGradient = getGradientMethod(context, GRAPH_MARGIN_Y, graphDepth);

    // Get x-axis scale helpers
    const unixMin = dateToUnix(earliestDate);
    const unixMax = dateToUnix(latestDate);
    const scaleUnixX = getScaleMethods(unixMin, unixMax, 0, graphWidth);
    const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

    // Get y-axis scale helpers
    const scalePriceY = getScaleMethods(yLabels[0], maxPrice, 0, graphDepth);

    // Calculate average price y-coordinate
    const averagePriceCanvasY = toCanvasY(scalePriceY(averagePrice));

    // Determine baseline min/max
    const minBaselineCanvasY = GRAPH_MARGIN_Y + 2 * SPACING_UNIT;
    const maxBaselineCanvasY = GRAPH_MARGIN_Y + graphDepth - 2 * SPACING_UNIT;

    // Determine baseline price y-coordinate
    const unclampedBaselineY =
      activeY && isClicked ? activeY : averagePriceCanvasY;
    const baselineYCanvasY = clamp(
      unclampedBaselineY,
      minBaselineCanvasY,
      maxBaselineCanvasY
    );

    // Calculate primary line points (price vs. date)
    const points = values.map(value => {
      const graphX = scaleDateX(value.dateTime);
      const graphY = scalePriceY(value.price);
      return { canvasX: toCanvasX(graphX), canvasY: toCanvasY(graphY), value };
    });

    const drawActiveLegend = (context: CanvasRenderingContext2D) => {
      // Fetch nearest point to active coordinates
      const [{ canvasX, canvasY, value }] = points.sort((a, b) => {
        return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
      });

      // Draw dashed active line
      context.strokeStyle = BORDER_COLOR;
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(canvasX, toCanvasY(graphDepth));
      context.lineTo(canvasX, toCanvasY(0));
      context.stroke();
      context.setLineDash([]);

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
      context.lineTo(anchorX - ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
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
      context.fillText(
        `$${priceLabel}    ${dateLabel}`,
        anchorX,
        anchorY + legendBottomY - SPACING_UNIT
      );
    };

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
      setGradient(PRIMARY_BASE(0.4), PRIMARY_BASE(0)),
      () => clipPath(context, points, width, baselineYCanvasY)
    );

    // Draw secondary block
    fillPath(
      context,
      [
        { canvasX: toCanvasX(0), canvasY: toCanvasY(graphDepth) },
        ...points,
        {
          canvasX: toCanvasX(graphWidth),
          canvasY: toCanvasY(graphDepth)
        }
      ],
      setGradient(SECONDARY_BASE(0.4), SECONDARY_BASE(0)),
      () => clipPath(context, points, width, baselineYCanvasY)
    );

    // Draw primary line
    drawLine(
      context,
      [
        { canvasX: toCanvasX(0), canvasY: baselineYCanvasY },
        { canvasX: toCanvasX(graphWidth), canvasY: baselineYCanvasY }
      ],
      PRIMARY_COLOR
    );

    // Draw baseline
    drawLine(context, points, PRIMARY_COLOR);

    // Draw active legend, if active
    if (activeX && activeY) {
      drawActiveLegend(context);
    }
  };
};
