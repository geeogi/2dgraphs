import moment from "moment";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  CONTRAST_COLOR,
  PRIMARY_BASE,
  PRIMARY_COLOR,
  SECONDARY_BASE
} from "../../Data/colors";
import {
  ACTIVE_LEGEND,
  AVERAGE_LEGEND,
  MOBILE_CANVAS_WIDTH,
  SPACING_UNIT
} from "./PeriodAverage/constants";
import {
  clamp,
  clipPath,
  getClearCanvasMethod,
  getDescaleCanvasResolutionMethod,
  getScaleCanvasResolutionMethod,
  getScaleMethods,
  lineThroughPoints
} from "./Utils/canvasUtils";
import { dateToUnix, getDateLabels, getPriceLabels } from "./Utils/labelUtils";
import { Canvas } from "../Canvas";

const PeriodAverageBase = (props: {
  activeX: number;
  activeY: number;
  averagePrice: number;
  canvasHeight: number;
  canvasResolutionScale: number;
  canvasWidth: number;
  earliestDate: string;
  isClicked: boolean;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  const [hasSetup, setHasSetup] = useState();

  // Element: the <canvas> element
  const canvasElement = useRef<HTMLCanvasElement>();

  // Props
  const {
    activeX,
    activeY,
    averagePrice,
    canvasHeight,
    canvasResolutionScale = 4,
    canvasWidth,
    earliestDate,
    isClicked,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

  const isMobile = canvasWidth <= MOBILE_CANVAS_WIDTH;

  useEffect(() => {
    // Fetch canvas context
    const { current } = canvasElement;
    if (current) {
      const context = current.getContext("2d");
      if (context) {
        // Get universal canvas util methods
        const scaleCanvasResolution = getScaleCanvasResolutionMethod(
          context,
          current,
          canvasWidth,
          canvasHeight,
          canvasResolutionScale
        );

        const descaleCanvasResolution = getDescaleCanvasResolutionMethod(
          context,
          canvasResolutionScale
        );

        const clearCanvas = getClearCanvasMethod(
          context,
          canvasWidth,
          canvasHeight
        );

        // Calculate graph dimensions
        const graphMarginY = 4 * SPACING_UNIT;
        const graphMarginX = 1 * SPACING_UNIT;
        const labelMarginX = 8 * SPACING_UNIT;
        const graphDepth = canvasHeight - 2 * graphMarginY;
        const graphWidth = canvasWidth - 2 * graphMarginX;

        // Configure graph-specific util methods
        const createVerticalColorFade = (
          primaryColor: string,
          secondaryColor: string
        ) => {
          const gradient = context.createLinearGradient(
            0,
            graphMarginY,
            0,
            graphMarginY + graphDepth
          );
          gradient.addColorStop(0, primaryColor);
          gradient.addColorStop(1, secondaryColor);
          return gradient;
        };

        // Get y-axis labels
        const yLabels = getPriceLabels(minPrice, maxPrice, 4);

        // Get x-axis labels
        const { dateLabels: xLabels, displayFormat } = getDateLabels(
          earliestDate,
          latestDate,
          4
        );

        // Get x-axis scale helpers
        const unixMin = dateToUnix(earliestDate);
        const unixMax = dateToUnix(latestDate);
        const xScale = getScaleMethods(unixMin, unixMax, 0, graphWidth);
        const { scale: scaleUnixX } = xScale;
        const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

        // Get y-axis scale helpers
        const yScale = getScaleMethods(yLabels[0], maxPrice, 0, graphDepth);
        const { scale: scalePriceY, descale: descalePriceY } = yScale;

        // Calculate baseline price y-coordinate
        const minActiveCanvasY = graphMarginY + 2 * SPACING_UNIT;
        const maxActiveCanvasY = graphMarginY + graphDepth - 2 * SPACING_UNIT;
        const activeYCanvasY = clamp(
          activeY,
          minActiveCanvasY,
          maxActiveCanvasY
        );
        const averagePriceGraphY = scalePriceY(averagePrice);
        const averagePriceCanvasY =
          graphMarginY + graphDepth - averagePriceGraphY;
        const showAverage = !isClicked || !activeY;
        const baselineYCanvasY = showAverage
          ? averagePriceCanvasY
          : activeYCanvasY;
        const baselineAmount = showAverage
          ? averagePrice
          : descalePriceY(graphMarginY + graphDepth - activeYCanvasY);

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
            const labelX = graphMarginX + scaleDateX(unix);
            if (labelX > labelMarginX && labelX < graphWidth - labelMarginX) {
              const labelY = graphMarginY + graphDepth + SPACING_UNIT * 3;
              context.fillText(
                moment(unix).format(displayFormat),
                labelX,
                labelY
              );
              context.moveTo(labelX, graphMarginY + graphDepth);
              context.lineTo(labelX, graphMarginY + graphDepth + SPACING_UNIT);
            }
          });

          // Add y-axis labels
          context.textAlign = "end";
          context.strokeStyle = BORDER_COLOR;
          yLabels.forEach(price => {
            const labelX = labelMarginX - 1.5 * SPACING_UNIT;
            const labelY = graphMarginY + graphDepth - scalePriceY(price);
            context.fillText(`$${Math.round(price)}`, labelX, labelY + 3);
            context.moveTo(labelMarginX, labelY);
            context.lineTo(graphWidth, labelY);
          });

          context.stroke();
        };

        // Calculate primary line points (price vs. date)
        const points = values.map(value => {
          const graphX = scaleDateX(value.dateTime);
          const graphY = scalePriceY(value.price);
          const canvasX = graphMarginX + graphX;
          const canvasY = graphMarginY + graphDepth - graphY;
          return { canvasX, canvasY, value };
        });

        // Method: Draw graph
        const drawGraph = (context: CanvasRenderingContext2D) => {
          // Primary-block: begin path
          context.beginPath();

          // Primary-block: create gradient
          context.fillStyle = createVerticalColorFade(
            PRIMARY_BASE(0.4),
            PRIMARY_BASE(0)
          );

          // Primary-block: configure clip
          context.save();
          clipPath(context, points, canvasWidth, baselineYCanvasY);

          // Primary-block: draw and fill path
          context.beginPath();
          context.moveTo(graphMarginX, graphMarginY + graphDepth);
          lineThroughPoints(context, points);
          context.lineTo(graphMarginX + graphWidth, graphMarginY + graphDepth);
          context.fill();

          // Reset clip to default
          context.restore();

          // Secondary-block: create gradient
          context.fillStyle = createVerticalColorFade(
            SECONDARY_BASE(0.4),
            SECONDARY_BASE(0)
          );

          // Secondary-block: configure clip
          context.save();
          clipPath(context, points, canvasWidth, 0);

          // Secondary-block: draw block
          context.beginPath();
          context.moveTo(graphMarginX, baselineYCanvasY);
          context.lineTo(graphMarginX + graphWidth, baselineYCanvasY);
          context.lineTo(graphMarginX + graphWidth, graphMarginY + graphDepth);
          context.lineTo(graphMarginX, graphMarginY + graphDepth);
          context.fill();

          // Reset clip to default
          context.restore();

          // Draw primary-line
          context.beginPath();
          context.lineWidth = 2;
          context.lineJoin = "round";
          context.strokeStyle = PRIMARY_COLOR;
          context.moveTo(points[0].canvasX, points[0].canvasY);
          lineThroughPoints(context, points);
          context.stroke();

          // Draw baseline
          context.lineWidth = 1;
          context.strokeStyle = PRIMARY_BASE(0.5);
          context.beginPath();
          context.moveTo(graphMarginX, baselineYCanvasY);
          context.lineTo(graphMarginX + graphWidth, baselineYCanvasY);
          context.stroke();

          // Draw baseline legend body (non-mobile only)
          if (baselineAmount && !isMobile) {
            context.fillStyle = BACKGROUND_COLOR;
            context.beginPath();
            context.moveTo(labelMarginX + SPACING_UNIT, baselineYCanvasY);
            context.lineTo(
              labelMarginX + SPACING_UNIT,
              baselineYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
            );
            context.lineTo(
              labelMarginX + SPACING_UNIT + AVERAGE_LEGEND.WIDTH,
              baselineYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
            );
            context.lineTo(
              labelMarginX + SPACING_UNIT + AVERAGE_LEGEND.WIDTH,
              baselineYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
            );
            context.lineTo(
              labelMarginX + SPACING_UNIT,
              baselineYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
            );
            context.lineTo(labelMarginX + SPACING_UNIT, baselineYCanvasY);
            context.fill();
            context.stroke();

            // Draw baseline legend text
            context.textAlign = "center";
            context.font = "12px Arial";
            context.fillStyle = CONTRAST_COLOR;
            context.fillText(
              `$${Math.round(baselineAmount)}`,
              labelMarginX + SPACING_UNIT + AVERAGE_LEGEND.WIDTH / 2,
              baselineYCanvasY + SPACING_UNIT / 2
            );
          }

          // Draw active legend
          if (activeX && activeY) {
            const pointsSortedByXPromityToActiveX = points.sort((a, b) => {
              return (
                Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX)
              );
            });
            const {
              canvasX,
              canvasY,
              value
            } = pointsSortedByXPromityToActiveX[0];

            // Draw dashed active line
            context.strokeStyle = BORDER_COLOR;
            context.lineWidth = 2;
            context.setLineDash([5, 5]);
            context.beginPath();
            context.moveTo(canvasX, graphMarginY);
            context.lineTo(canvasX, graphDepth + graphMarginY);
            context.stroke();
            context.setLineDash([]);

            // Draw active legend body
            context.strokeStyle = PRIMARY_COLOR;
            context.fillStyle = BACKGROUND_COLOR;
            context.beginPath();

            const legendBottomY = graphMarginY + 5 * SPACING_UNIT;
            const legendTopY = legendBottomY - 3 * SPACING_UNIT;

            const anchorY =
              canvasY < legendBottomY ? canvasY - graphMarginY : 0;
            const anchorX = clamp(
              canvasX,
              labelMarginX,
              canvasWidth - labelMarginX
            );

            context.moveTo(
              anchorX - ACTIVE_LEGEND.WIDTH / 2,
              anchorY + legendTopY
            );
            context.lineTo(
              anchorX - ACTIVE_LEGEND.WIDTH / 2,
              anchorY + legendTopY
            );
            context.lineTo(
              anchorX - ACTIVE_LEGEND.WIDTH / 2,
              anchorY + legendBottomY
            );
            context.lineTo(
              anchorX + ACTIVE_LEGEND.WIDTH / 2,
              anchorY + legendBottomY
            );
            context.lineTo(
              anchorX + ACTIVE_LEGEND.WIDTH / 2,
              anchorY + legendTopY
            );
            context.lineTo(
              anchorX - ACTIVE_LEGEND.WIDTH / 2,
              anchorY + legendTopY
            );
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
            context.fillStyle = CONTRAST_COLOR;
            context.textAlign = "center";
            const priceLabel = Math.round(value.price);
            const dateLabel = moment(value.dateTime).format("DD MMM YY");
            context.fillText(
              `$${priceLabel}    ${dateLabel}`,
              anchorX,
              anchorY + legendBottomY - SPACING_UNIT
            );
          }
        };

        // Setup graph resolution on first render
        if (!hasSetup) {
          scaleCanvasResolution();
          setHasSetup(true);
        } else {
          descaleCanvasResolution();
          scaleCanvasResolution();
        }

        // Draw graph on every render
        drawGraphAxes(context);
        drawGraph(context);

        // Clean up
        return () => clearCanvas();
      }
    }
  }, [
    activeX,
    activeY,
    averagePrice,
    canvasHeight,
    canvasResolutionScale,
    canvasWidth,
    earliestDate,
    hasSetup,
    isClicked,
    latestDate,
    maxPrice,
    minPrice,
    values
  ]);

  return (
    <Canvas
      ref={canvasElement as any}
      height={canvasHeight}
      width={canvasWidth}
    />
  );
};

export const PeriodAverage = memo(PeriodAverageBase);
