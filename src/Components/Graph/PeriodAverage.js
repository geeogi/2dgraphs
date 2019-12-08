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
  getScaleMethod
} from "./Utils/canvasUtils";
import { dateLabels, dateToUnix, priceLabels } from "./Utils/labelUtils";

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
    const graphMargin = 8 * canvasSpacingUnit;
    const graphHeight = canvasHeight - 2 * graphMargin;
    const graphWidth = canvasWidth - 2 * graphMargin;

    // Calculate graph legend dimensions
    const ACTIVE_LEGEND = {
      WIDTH: graphMargin * 2 - canvasSpacingUnit
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
    const minNumberOfXLabels = canvasWidth < 600 ? 2 : 4;
    const { dateLabels: xLabels, displayFormat } = dateLabels(
      earliestDate,
      latestDate,
      minNumberOfXLabels
    );
    const xAxisMin = dateToUnix(earliestDate);
    const xAxisMax = dateToUnix(latestDate);

    // Get axis scale helpers
    const scaleUnixX = getScaleMethod(xAxisMin, xAxisMax, graphWidth);
    const scaleDateX = date => scaleUnixX(dateToUnix(date));
    const scalePriceY = getScaleMethod(yAxisMin, yAxisMax, graphHeight);

    // Calculate baseLine price y-coordinate
    const activeYHeight = graphMargin + graphHeight - activeY;
    const activeYCanvasY = activeY;

    const averagePriceY = scalePriceY(averagePrice);
    const averagePriceCanvasY = graphMargin + graphHeight - averagePriceY;

    const baseLineY = isClicked ? activeYHeight : averagePriceY;
    const baseLineYCanvasY = isClicked ? activeYCanvasY : averagePriceCanvasY;

    const baseLineAmount = isClicked ? undefined : averagePrice;

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

    // Method: Draw x,y axes and add labels
    const drawGraphAxes = context => {
      context.beginPath();
      context.setLineDash([]);
      context.fillStyle = CONTRAST_COLOR;
      context.strokeStyle = CONTRAST_COLOR;
      context.lineWidth = 1;
      context.font = "12px Arial";
      context.textAlign = "start";

      // Draw x-axis
      context.moveTo(graphMargin, graphHeight + graphMargin);
      context.lineTo(graphWidth + graphMargin, graphHeight + graphMargin);

      // Draw y-axis
      context.moveTo(graphMargin, graphMargin);
      context.lineTo(graphMargin, graphHeight + graphMargin);

      // Add x-axis labels
      context.textAlign = "center";
      xLabels.forEach(unix => {
        const labelX = graphMargin + scaleDateX(unix);
        const labelY = graphMargin + graphHeight + canvasSpacingUnit * 3;
        context.fillText(moment(unix).format(displayFormat), labelX, labelY);
        context.moveTo(labelX, graphMargin + graphHeight);
        context.lineTo(labelX, graphMargin + graphHeight + canvasSpacingUnit);
      });

      // Add y-axis labels
      context.textAlign = "end";
      yLabels.forEach(price => {
        const labelX = graphMargin - 1.5 * canvasSpacingUnit;
        const labelY = graphMargin + graphHeight - scalePriceY(price);
        context.fillText(`$${Math.round(price)}`, labelX, labelY + 2);
        context.moveTo(graphMargin - canvasSpacingUnit, labelY);
        context.lineTo(graphMargin, labelY);
      });

      context.stroke();
    };

    // Method: Draw graph
    const drawGraph = context => {
      // Calculate points
      const points = values.map(value => {
        const graphX = scaleDateX(value.dateTime);
        const graphY = scalePriceY(value.price);
        const canvasX = graphMargin + graphX;
        const canvasY = graphMargin + graphHeight - graphY;
        return { canvasX, canvasY, value };
      });

      // Primary-block: begin path
      context.beginPath();
      context.strokeStyle = "rgba(9,211,172,1)";
      context.lineJoin = "round";

      // Primary-block: create gradient
      const primaryGradient = context.createLinearGradient(
        0,
        graphMargin,
        0,
        graphMargin + graphHeight
      );
      primaryGradient.addColorStop(0, PRIMARY_BASE(0.4));
      primaryGradient.addColorStop(1, PRIMARY_BASE(0));
      context.fillStyle = primaryGradient;

      // Primary-block: draw and fill path
      context.lineTo(graphMargin, graphMargin + graphHeight);
      points.forEach(({ canvasX, canvasY }) => {
        context.lineTo(canvasX, canvasY);
      });
      context.lineTo(graphMargin + graphWidth, graphMargin + graphHeight);
      context.fill();

      // Primary-block: save primary-block for later
      const blockImageData = context.getImageData(
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin, // y
        canvasResolutionScale * graphWidth, // w
        canvasResolutionScale * (graphHeight - baseLineY) // h
      );

      // Clear graph
      context.clearRect(graphMargin, graphMargin, graphWidth, graphHeight);

      // Secondary-block: create gradient
      const secondaryGradient = context.createLinearGradient(
        0,
        graphMargin,
        0,
        graphMargin + graphHeight
      );
      secondaryGradient.addColorStop(0, SECONDARY_BASE(0.4));
      secondaryGradient.addColorStop(1, SECONDARY_BASE(0));
      context.fillStyle = secondaryGradient;

      // Secondary-block: draw block
      context.beginPath();
      context.moveTo(graphMargin, baseLineYCanvasY);
      context.lineTo(graphMargin + graphWidth, baseLineYCanvasY);
      context.lineTo(graphMargin + graphWidth, graphMargin + graphHeight);
      context.lineTo(graphMargin, graphMargin + graphHeight);
      context.fill();

      // Draw ternary-block
      context.beginPath();
      context.fillStyle = BACKGROUND_COLOR;
      context.lineTo(graphMargin, graphMargin + graphHeight);
      points.forEach(({ canvasX, canvasY }) => {
        context.lineTo(canvasX, canvasY);
      });
      context.lineTo(graphMargin + graphWidth, graphMargin + graphHeight);
      context.fill();

      // Re-add the primary-block
      context.putImageData(
        blockImageData,
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin // y
      );

      // Draw primary-line
      context.beginPath();
      context.fillStyle = BACKGROUND_COLOR;
      context.moveTo(points[0].canvasX, points[0].canvasY);
      points.forEach(({ canvasX, canvasY }) => {
        context.lineTo(canvasX, canvasY);
      });
      context.stroke();

      // Draw average-line
      context.strokeStyle = PRIMARY_BASE(0.5);
      context.beginPath();
      context.moveTo(graphMargin, baseLineYCanvasY);
      context.lineTo(graphMargin + graphWidth, baseLineYCanvasY);
      context.stroke();

      // Draw average legend body
      if (baseLineAmount) {
        context.fillStyle = BACKGROUND_COLOR;
        context.beginPath();
        context.moveTo(graphMargin + canvasSpacingUnit, baseLineYCanvasY);
        context.lineTo(
          graphMargin + canvasSpacingUnit,
          baseLineYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(
          graphMargin + canvasSpacingUnit + AVERAGE_LEGEND.WIDTH,
          baseLineYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(
          graphMargin + canvasSpacingUnit + AVERAGE_LEGEND.WIDTH,
          baseLineYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(
          graphMargin + canvasSpacingUnit,
          baseLineYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
        );
        context.lineTo(graphMargin + canvasSpacingUnit, baseLineYCanvasY);
        context.fill();
        context.stroke();

        // Draw average legend text
        context.textAlign = "center";
        context.font = "12px Arial";
        context.fillStyle = CONTRAST_COLOR;
        context.fillText(
          `$${Math.round(baseLineAmount)}`,
          graphMargin + canvasSpacingUnit + AVERAGE_LEGEND.WIDTH / 2,
          baseLineYCanvasY + canvasSpacingUnit / 2
        );
      }

      // Draw graph axes
      drawGraphAxes(context);

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
        context.moveTo(canvasX, graphMargin);
        context.lineTo(canvasX, graphHeight + graphMargin);
        context.stroke();

        // Draw active legend body
        context.setLineDash([]);
        context.strokeStyle = PRIMARY_COLOR;
        context.fillStyle = BACKGROUND_COLOR;
        context.beginPath();
        const legendBottomY = graphMargin + 5 * canvasSpacingUnit;
        const legendTopY = legendBottomY - 3 * canvasSpacingUnit;
        const anchorY = canvasY < legendBottomY ? canvasY - graphMargin : 0;
        context.moveTo(canvasX - ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
        context.lineTo(canvasX - ACTIVE_LEGEND.WIDTH / 2, anchorY + legendTopY);
        context.lineTo(
          canvasX - ACTIVE_LEGEND.WIDTH / 2,
          anchorY + legendBottomY
        );
        context.lineTo(
          canvasX + ACTIVE_LEGEND.WIDTH / 2,
          anchorY + legendBottomY
        );
        context.lineTo(
          canvasX + ACTIVE_LEGEND.WIDTH / 2,
          anchorY + legendBottomY - 3 * canvasSpacingUnit
        );
        context.lineTo(
          canvasX - ACTIVE_LEGEND.WIDTH / 2,
          anchorY + legendBottomY - 3 * canvasSpacingUnit
        );
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
          canvasX,
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
