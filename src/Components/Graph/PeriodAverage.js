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
  getClearCanvasMethod,
  getDescaleCanvasResolutionMethod,
  getScaleCanvasResolutionMethod,
  getScaleMethods,
  clipPath,
  lineThroughPoints,
  clamp
} from "./Utils/canvasUtils";
import { dateLabels, dateToUnix, priceLabels } from "./Utils/labelUtils";

const MOBILE_CANVAS_WIDTH = 600;

const PeriodAverageBase = props => {
  const [hasSetup, setHasSetup] = useState();

  // Element: the <canvas> element
  const canvasElement = useRef();

  // Props
  const {
    disabled = false,
    canvasHeight,
    canvasWidth,
    canvasResolutionScale = 4,
    canvasSpacingUnit = 8,
    values,
    minPrice,
    maxPrice,
    averagePrice,
    earliestDate,
    latestDate,
    activeX,
    activeY,
    isClicked
  } = props;

  useEffect(() => {
    // Fetch canvas context
    const { current } = canvasElement;
    const context = current.getContext("2d");

    // Calculate graph dimensions
    const graphMarginY = 8 * canvasSpacingUnit;
    const graphMarginX = 0;
    const labelMarginX = graphMarginY;
    const graphDepth = canvasHeight - 2 * graphMarginY;
    const graphWidth = canvasWidth - 2 * graphMarginX;

    // Calculate graph legend dimensions
    const ACTIVE_LEGEND = {
      WIDTH: 120
    };
    const AVERAGE_LEGEND = {
      WIDTH: 72,
      HEIGHT: 24
    };

    // Get y-axis labels
    const yLabels = priceLabels(minPrice, maxPrice, 4);
    const yAxisMin = yLabels[0];
    const yAxisMax = yLabels[yLabels.length - 1];

    // Get x-axis labels
    const minNumberOfXLabels = canvasWidth < MOBILE_CANVAS_WIDTH ? 2 : 4;
    const { dateLabels: xLabels, displayFormat } = dateLabels(
      earliestDate,
      latestDate,
      minNumberOfXLabels
    );
    const xAxisMin = dateToUnix(earliestDate);
    const xAxisMax = dateToUnix(latestDate);

    // Get axis scale helpers
    const { scale: scaleUnixX } = getScaleMethods(
      xAxisMin,
      xAxisMax,
      0,
      graphWidth
    );
    const scaleDateX = date => scaleUnixX(dateToUnix(date));
    const { scale: scalePriceY, descale: descalePriceY } = getScaleMethods(
      yAxisMin,
      yAxisMax,
      0,
      graphDepth
    );

    // Calculate baseLine price y-coordinate
    const minActiveCanvasY = graphMarginY + 2 * canvasSpacingUnit;
    const maxActiveCanvasY = graphMarginY + graphDepth - 2 * canvasSpacingUnit;
    const activeYCanvasY = clamp(activeY, minActiveCanvasY, maxActiveCanvasY);
    const averagePriceGraphY = scalePriceY(averagePrice);
    const averagePriceCanvasY = graphMarginY + graphDepth - averagePriceGraphY;
    const showAverage = !isClicked || !activeY;
    const baseLineYCanvasY = showAverage ? averagePriceCanvasY : activeYCanvasY;
    const baseLineAmount = showAverage
      ? averagePrice
      : descalePriceY(graphMarginY + graphDepth - activeYCanvasY);

    // Get canvas util methods
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

    const createVerticalColorFade = (primaryColor, secondaryColor) => {
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

    // Method: Draw x,y axes and add labels
    const drawGraphAxes = context => {
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
        const labelX = scaleDateX(unix);
        if (labelX > labelMarginX) {
          const labelY = graphMarginY + graphDepth + canvasSpacingUnit * 3;
          context.fillText(moment(unix).format(displayFormat), labelX, labelY);
          context.moveTo(labelX, graphMarginY + graphDepth);
          context.lineTo(labelX, graphMarginY + graphDepth + canvasSpacingUnit);
        }
      });

      // Add y-axis labels
      context.textAlign = "end";
      context.strokeStyle = BORDER_COLOR;
      yLabels.forEach(price => {
        const labelX = labelMarginX - 1.5 * canvasSpacingUnit;
        const labelY = graphMarginY + graphDepth - scalePriceY(price);
        context.fillText(`$${Math.round(price)}`, labelX, labelY + 3);
        context.moveTo(labelMarginX, labelY);
        context.lineTo(graphWidth, labelY);
      });

      context.stroke();
    };

    // Method: Draw graph
    const drawGraph = context => {
      // Calculate points
      const points = values.map(value => {
        const graphX = scaleDateX(value.dateTime);
        const graphY = scalePriceY(value.price);
        const canvasX = graphMarginX + graphX;
        const canvasY = graphMarginY + graphDepth - graphY;
        return { canvasX, canvasY, value };
      });

      // Primary-block: begin path
      context.beginPath();

      // Primary-block: create gradient
      context.fillStyle = createVerticalColorFade(
        PRIMARY_BASE(0.4),
        PRIMARY_BASE(0)
      );

      // Primary-block: configure clip
      context.save();
      clipPath(context, points, canvasWidth, baseLineYCanvasY);

      // Primary-block: draw and fill path
      context.beginPath();
      context.moveTo(graphMarginX, graphMarginY + graphDepth);
      lineThroughPoints(context, points);
      context.lineTo(graphMarginX + graphWidth, graphMarginY + graphDepth);
      context.fill();

      // Restore clip
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
      context.moveTo(graphMarginX, baseLineYCanvasY);
      context.lineTo(graphMarginX + graphWidth, baseLineYCanvasY);
      context.lineTo(graphMarginX + graphWidth, graphMarginY + graphDepth);
      context.lineTo(graphMarginX, graphMarginY + graphDepth);
      context.fill();

      // Restore clip
      context.restore();

      // Draw primary-line
      context.beginPath();
      context.strokeStyle = PRIMARY_COLOR;
      context.moveTo(points[0].canvasX, points[0].canvasY);
      lineThroughPoints(context, points);
      context.stroke();

      // Draw baseline
      context.strokeStyle = PRIMARY_BASE(0.5);
      context.beginPath();
      context.moveTo(graphMarginX, baseLineYCanvasY);
      context.lineTo(graphMarginX + graphWidth, baseLineYCanvasY);
      context.stroke();

      // Draw baseline legend body
      if (baseLineAmount && canvasWidth > MOBILE_CANVAS_WIDTH) {
        context.fillStyle = BACKGROUND_COLOR;
        context.beginPath();
        context.moveTo(labelMarginX + canvasSpacingUnit, baseLineYCanvasY);
        context.lineTo(
          labelMarginX + canvasSpacingUnit,
          baseLineYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(
          labelMarginX + canvasSpacingUnit + AVERAGE_LEGEND.WIDTH,
          baseLineYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(
          labelMarginX + canvasSpacingUnit + AVERAGE_LEGEND.WIDTH,
          baseLineYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(
          labelMarginX + canvasSpacingUnit,
          baseLineYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(labelMarginX + canvasSpacingUnit, baseLineYCanvasY);
        context.fill();
        context.stroke();

        // Draw baseline legend text
        context.textAlign = "center";
        context.font = "12px Arial";
        context.fillStyle = CONTRAST_COLOR;
        context.fillText(
          `$${Math.round(baseLineAmount)}`,
          labelMarginX + canvasSpacingUnit + AVERAGE_LEGEND.WIDTH / 2,
          baseLineYCanvasY + canvasSpacingUnit / 2
        );
      }

      // Draw active legend
      if (activeX && activeY) {
        const sortedPoints = points.sort((a, b) => {
          return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
        });
        const { canvasX, canvasY, value } = sortedPoints[0];

        // Draw active line
        context.strokeStyle = BORDER_COLOR;
        context.setLineDash([5, 5]);
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(canvasX, graphMarginY);
        context.lineTo(canvasX, graphDepth + graphMarginY);
        context.stroke();

        // Draw active legend body
        context.setLineDash([]);
        context.strokeStyle = PRIMARY_COLOR;
        context.fillStyle = BACKGROUND_COLOR;
        context.beginPath();

        const legendBottomY = graphMarginY + 5 * canvasSpacingUnit;
        const legendTopY = legendBottomY - 3 * canvasSpacingUnit;

        const anchorY = canvasY < legendBottomY ? canvasY - graphMarginY : 0;
        const anchorX = clamp(
          canvasX,
          labelMarginX,
          canvasWidth - labelMarginX
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
        context.lineTo(anchorX - ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
        context.stroke();
        context.fill();

        // Draw active legend circular handle
        context.fillStyle = PRIMARY_COLOR;
        context.strokeStyle = BACKGROUND_COLOR;
        context.beginPath();
        context.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
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
          anchorY + legendBottomY - canvasSpacingUnit
        );
      }
    };

    // Setup graph resolution
    if (!hasSetup) {
      scaleCanvasResolution();
      setHasSetup(true);
    } else {
      descaleCanvasResolution();
      scaleCanvasResolution();
    }

    // Draw graph
    if (!disabled) {
      drawGraphAxes(context);
      drawGraph(context);
    }

    // Clean up
    return () => clearCanvas();
  }, [
    canvasHeight,
    canvasWidth,
    hasSetup,
    canvasResolutionScale,
    disabled,
    canvasSpacingUnit,
    values,
    averagePrice,
    maxPrice,
    minPrice,
    activeX,
    activeY,
    isClicked,
    earliestDate,
    latestDate
  ]);

  return (
    <canvas
      name="frequency"
      ref={canvasElement}
      height={canvasHeight}
      width={canvasWidth}
    />
  );
};

export const PeriodAverage = memo(PeriodAverageBase);
