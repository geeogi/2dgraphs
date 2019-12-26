import moment from "moment";
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  CONTRAST_COLOR,
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

interface Props {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}

export const getRenderMethod = (props: Props) => {
  const {
    averagePrice,
    earliestDate,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

  return (renderVariables?: {
    canvasElement?: HTMLCanvasElement;
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => {
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
    const graphMarginY = 4 * SPACING_UNIT;
    const graphMarginX = 1 * SPACING_UNIT;
    const labelMarginX = 8 * SPACING_UNIT;
    const graphDepth = height - 2 * graphMarginY;
    const graphWidth = width - 2 * graphMarginX;

    // Utils to convert from graph coordinates to canvas pixels
    const toCanvasY = (graphY: number) => graphMarginY + graphDepth - graphY;
    const toCanvasX = (graphX: number) => graphMarginX + graphX;

    // Get canvas util methods
    const scaleRetina = getRetinaMethod(context, canvasElement, width, height);
    const gradient = getGradientMethod(context, graphMarginY, graphDepth);

    // Get y-axis labels
    const yConfig = getPriceLabels(minPrice, maxPrice, 4);
    const { priceLabels: yLabels } = yConfig;

    // Get x-axis labels
    const xConfig = getDateLabels(earliestDate, latestDate, 4);
    const { dateLabels: xLabels, displayFormat: xDisplayFormat } = xConfig;

    // Get x-axis scale helpers
    const unixMin = dateToUnix(earliestDate);
    const unixMax = dateToUnix(latestDate);
    const xScale = getScaleMethods(unixMin, unixMax, 0, graphWidth);
    const { scale: scaleUnixX } = xScale;
    const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

    // Get y-axis scale helpers
    const yScale = getScaleMethods(yLabels[0], maxPrice, 0, graphDepth);
    const { scale: scalePriceY } = yScale;

    // Calculate average price y-coordinate
    const averagePriceGraphY = scalePriceY(averagePrice);
    const averagePriceCanvasY = toCanvasY(averagePriceGraphY);

    // Determine baseline min/max
    const minBaselineCanvasY = graphMarginY + 2 * SPACING_UNIT;
    const maxBaselineCanvasY = graphMarginY + graphDepth - 2 * SPACING_UNIT;

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

    // Method: Draw x,y axes and add labels
    const drawGraphAxes = (context: CanvasRenderingContext2D) => {
      context.beginPath();
      context.setLineDash([]);
      context.fillStyle = CONTRAST_COLOR;
      context.strokeStyle = CONTRAST_COLOR;
      context.lineWidth = 1;
      context.font = "12px Arial";
      context.textAlign = "start";

      // Add x-axis labels
      context.textAlign = "center";
      xLabels.forEach(unix => {
        const labelX = toCanvasX(scaleDateX(unix));
        if (labelX > labelMarginX && labelX < graphWidth - labelMarginX) {
          const labelY = graphMarginY + graphDepth + SPACING_UNIT * 3;
          context.fillText(moment(unix).format(xDisplayFormat), labelX, labelY);
          context.moveTo(labelX, graphMarginY + graphDepth);
          context.lineTo(labelX, graphMarginY + graphDepth + SPACING_UNIT);
        }
      });

      // Add y-axis labels
      context.textAlign = "end";
      context.strokeStyle = BORDER_COLOR;
      yLabels.forEach(price => {
        const labelX = labelMarginX - 1.5 * SPACING_UNIT;
        const labelY = toCanvasY(scalePriceY(price));
        context.fillText(`$${Math.round(price)}`, labelX, labelY + 3);
        context.moveTo(labelMarginX, labelY);
        context.lineTo(graphWidth, labelY);
      });

      context.stroke();
    };

    const drawActiveLegend = (context: CanvasRenderingContext2D) => {
      // Find nearest point to active coordinates
      const pointsSortedByXProximityToActiveX = points.sort((a, b) => {
        return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
      });
      const { canvasX, canvasY, value } = pointsSortedByXProximityToActiveX[0];

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
      const anchorX = clamp(canvasX, labelMarginX, width - labelMarginX);

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

    // Draw graph
    scaleRetina();

    drawGraphAxes(context);

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
      gradient(PRIMARY_BASE(0.4), PRIMARY_BASE(0)),
      () => clipPath(context, points, width, baselineYCanvasY)
    );

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
      gradient(SECONDARY_BASE(0.4), SECONDARY_BASE(0)),
      () => clipPath(context, points, width, baselineYCanvasY)
    );

    drawLine(
      context,
      [
        { canvasX: toCanvasX(0), canvasY: baselineYCanvasY },
        { canvasX: toCanvasX(graphWidth), canvasY: baselineYCanvasY }
      ],
      PRIMARY_COLOR
    );

    drawLine(context, points, PRIMARY_COLOR);

    if (activeX && activeY) {
      drawActiveLegend(context);
    }
  };
};
