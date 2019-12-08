import moment from "moment";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  BACKGROUND_COLOR,
  CONTRAST_COLOR,
  PRIMARY_BASE,
  PRIMARY_COLOR,
  BORDER_COLOR
} from "../../Data/colors";
import {
  getClearCanvasMethod,
  getScaleMethod,
  getScaleCanvasResolutionMethod,
  getDescaleCanvasResolutionMethod
} from "./Utils/canvasUtils";
import {
  dateLabels,
  dateToUnix,
  DATE_FORMAT,
  priceLabels
} from "./Utils/labelUtils";

const ACTIVE_LEGEND = {
  WIDTH: 120
};

const AVERAGE_LEGEND = {
  WIDTH: 72,
  HEIGHT: 24
};

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

    const graphMargin = 8 * canvasSpacingUnit;
    const graphHeight = canvasHeight - 2 * graphMargin;
    const graphWidth = canvasWidth - 2 * graphMargin;

    const yLabels = priceLabels(minPrice, maxPrice, 4);
    const yAxisMin = yLabels[0];
    const yAxisMax = yLabels[yLabels.length - 1];

    const xLabels = dateLabels(earliestDate, latestDate);
    const xAxisMin = dateToUnix(earliestDate);
    const xAxisMax = dateToUnix(latestDate);

    const scaleUnixX = getScaleMethod(xAxisMin, xAxisMax, graphWidth);
    const scaleDateX = date => scaleUnixX(dateToUnix(date));
    const scalePriceY = getScaleMethod(yAxisMin, yAxisMax, graphHeight);

    const averageY = scalePriceY(averagePrice);

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
        context.fillText(moment(unix).format(DATE_FORMAT), labelX, labelY);
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

      // Color block: begin path
      context.beginPath();
      context.strokeStyle = "rgba(9,211,172,1)";
      context.lineJoin = "round";

      // Color block: create gradient
      var gradient = context.createLinearGradient(
        0,
        graphMargin,
        0,
        graphMargin + graphHeight
      );
      gradient.addColorStop(0, "rgba(9,211,172,0.4)");
      gradient.addColorStop(1, "rgba(9,211,172,0)");
      context.fillStyle = gradient;

      // Color block: draw, stroke and fill path
      context.lineTo(graphMargin, graphMargin + graphHeight);
      points.forEach(({ canvasX, canvasY }) => {
        context.lineTo(canvasX, canvasY);
      });
      context.lineTo(graphMargin + graphWidth, graphMargin + graphHeight);
      context.stroke();
      context.fill();

      // Color block: clear block underneath the average line
      context.clearRect(
        graphMargin,
        graphMargin + graphHeight - averageY,
        graphWidth,
        averageY
      );

      // Color block: save color block for later
      const blockImageData = context.getImageData(
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin, // y
        canvasResolutionScale * graphWidth, // w
        canvasResolutionScale * (graphHeight - averageY) // h
      );

      // Clear graph
      context.clearRect(graphMargin, graphMargin, graphWidth, graphHeight);

      // Draw dashed path
      context.setLineDash([5, 5]);
      context.beginPath();
      points.forEach(({ canvasX, canvasY }) => {
        context.lineTo(canvasX, canvasY);
      });
      context.stroke();

      // Clear dashed path above the average line
      context.clearRect(
        graphMargin,
        graphMargin,
        graphWidth,
        graphHeight - averageY
      );

      // Draw average line
      context.setLineDash([]);
      context.strokeStyle = PRIMARY_COLOR;
      context.lineWidth = 2;
      context.beginPath();
      const graphY = averageY;
      const averageYCanvasY = graphMargin + graphHeight - graphY;
      context.moveTo(graphMargin, averageYCanvasY);
      context.lineTo(graphMargin + graphWidth, averageYCanvasY);
      context.stroke();

      // Re-add the color block
      context.putImageData(
        blockImageData,
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin // y
      );

      // Draw average legend body
      context.fillStyle = BACKGROUND_COLOR;
      context.strokeStyle = PRIMARY_COLOR;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(graphMargin * 2, averageYCanvasY);
      context.lineTo(
        graphMargin * 2,
        averageYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
      );
      context.lineTo(
        graphMargin * 2 + AVERAGE_LEGEND.WIDTH,
        averageYCanvasY - AVERAGE_LEGEND.HEIGHT / 2
      );
      context.lineTo(
        graphMargin * 2 + AVERAGE_LEGEND.WIDTH,
        averageYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
      );
      context.lineTo(
        graphMargin * 2,
        averageYCanvasY + AVERAGE_LEGEND.HEIGHT / 2
      );
      context.lineTo(graphMargin * 2, averageYCanvasY);
      context.fill();
      context.stroke();

      // Draw average legend text
      context.textAlign = "center";
      context.font = "12px Arial";
      context.fillStyle = CONTRAST_COLOR;
      context.fillText(
        `$${Math.round(averagePrice)}`,
        graphMargin * 2 + AVERAGE_LEGEND.WIDTH / 2,
        averageYCanvasY + canvasSpacingUnit / 2
      );

      // Draw graph axes
      drawGraphAxes(context);

      // Draw active legend
      if (activeX && activeY) {
        context.fillStyle = PRIMARY_COLOR;
        const sortedPoints = points.sort((a, b) => {
          return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
        });
        const { canvasX, canvasY, value } = sortedPoints[0];

        // Draw active axes
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

        // Draw active legend handle
        context.fillStyle = PRIMARY_COLOR;
        context.strokeStyle = BACKGROUND_COLOR;
        context.beginPath();
        context.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        // Write active legend text
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
