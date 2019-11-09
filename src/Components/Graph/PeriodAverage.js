import React, { memo, useEffect, useRef, useState } from "react";
import {
  PRIMARY_COLOR,
  BACKGROUND_COLOR,
  CONTRAST_COLOR
} from "../../Data/colors";

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
    averageValue,
    minValue,
    maxValue,
    activeX,
    activeY
  } = props;

  useEffect(() => {
    // Fetch canvas context
    const { current } = canvasElement;
    const context = current.getContext("2d");

    const graphMargin = 5 * canvasSpacingUnit;
    const graphHeight = canvasHeight - 2 * graphMargin;
    const graphWidth = canvasWidth - 2 * graphMargin;

    // Method: Scale canvas resolution for retina displays
    const scaleCanvasResolution = context => {
      current.style.width = canvasWidth + "px";
      current.style.height = canvasHeight + "px";
      current.width = canvasWidth * 4;
      current.height = canvasHeight * 4;
      context.scale(canvasResolutionScale, canvasResolutionScale);
    };

    // Method: descale canvas
    const descaleCanvasResolution = context => {
      context.scale(1 / canvasResolutionScale, 1 / canvasResolutionScale);
    };

    // Method: Draw x,y axes and add labels
    const drawGraphAxes = context => {
      context.beginPath();
      context.setLineDash([]);
      context.fillStyle = "#fff";
      context.strokeStyle = "#fff";
      context.lineWidth = 1;
      context.font = "12px Arial";

      // Draw x-axis
      context.moveTo(graphMargin, graphHeight + graphMargin);
      context.lineTo(graphWidth + graphMargin, graphHeight + graphMargin);

      // Draw y-axis
      context.moveTo(graphMargin, graphMargin);
      context.lineTo(graphMargin, graphHeight + graphMargin);

      // Add x-axis labels

      // Add y-axis labels
      const numberOfYAxisLabels = 5;
      const numberOfYLegendGridRows = numberOfYAxisLabels - 1;
      const valueRange = maxValue - minValue;
      const valueStep = valueRange / numberOfYLegendGridRows;
      const yStep = graphHeight / numberOfYLegendGridRows;
      [...Array(numberOfYAxisLabels)].forEach((_, index) => {
        const labelValue = minValue + valueStep * index;
        const labelY = graphMargin + yStep * (numberOfYLegendGridRows - index);
        context.fillText(Math.round(labelValue), 0, labelY);
        context.moveTo(graphMargin - canvasSpacingUnit, labelY);
        context.lineTo(graphMargin, labelY);
      });

      context.stroke();
    };

    // Method: Draw graph
    const drawGraph = context => {
      const normalise = value => value - minValue;
      const getYFactor = value => normalise(value) / normalise(maxValue);
      const getY = value => getYFactor(value) * graphHeight;
      const averageY = getY(averageValue);

      // Calculate points
      const points = values.map((value, index) => {
        const graphX = index * (graphWidth / (values.length - 1));
        const graphY = getY(value);
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
      gradient.addColorStop(1 - getYFactor(averageValue), "rgba(9,211,172,0)");
      context.fillStyle = gradient;

      // Color block: draw, stroke and fill path
      points.forEach(({ canvasX, canvasY }, index) => {
        context.lineTo(canvasX, canvasY);
        if (index === points.length - 1) {
          context.lineTo(canvasX, canvasY);
          context.lineTo(graphMargin + graphWidth, graphMargin + graphHeight);
        }
      });
      context.stroke();
      context.fill();

      // Color block: clear block underneath the average line
      context.clearRect(
        graphMargin,
        graphMargin + graphHeight - averageY,
        graphWidth + 1,
        averageY
      );
      context.clearRect(
        graphMargin + graphWidth - 1,
        graphMargin,
        2,
        graphHeight
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
      context.strokeStyle = "rgba(9,211,172,1)";
      context.lineWidth = 2;
      context.beginPath();
      const graphY = averageY;
      context.moveTo(graphMargin, graphMargin + graphHeight - graphY);
      context.lineTo(
        graphMargin + graphWidth,
        graphMargin + graphHeight - graphY
      );
      context.stroke();

      // Re-add the color block
      context.putImageData(
        blockImageData,
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin // y
      );

      // Draw active region
      if (activeX && activeY) {
        context.fillStyle = PRIMARY_COLOR;
        const sortedPoints = points.sort((a, b) => {
          return Math.abs(a.canvasX - activeX) - Math.abs(b.canvasX - activeX);
        });
        const [{ canvasX, canvasY, value }] = sortedPoints;

        // Draw active legend
        context.strokeStyle = PRIMARY_COLOR;
        context.fillStyle = BACKGROUND_COLOR;
        context.beginPath();
        context.moveTo(canvasX, canvasY);
        context.lineTo(
          canvasX - 2 * canvasSpacingUnit,
          canvasY - 2 * canvasSpacingUnit
        );
        context.lineTo(canvasX - graphMargin, canvasY - 2 * canvasSpacingUnit);
        context.lineTo(canvasX - graphMargin, canvasY + 2 * canvasSpacingUnit);
        context.lineTo(
          canvasX - 2 * canvasSpacingUnit,
          canvasY + 2 * canvasSpacingUnit
        );
        context.lineTo(canvasX, canvasY);
        context.stroke();
        context.fill();

        // Draw active handle
        context.fillStyle = PRIMARY_COLOR;
        context.strokeStyle = BACKGROUND_COLOR;
        context.beginPath();
        context.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        // Write text
        context.fillStyle = CONTRAST_COLOR;
        context.fillText(
          Math.round(value),
          canvasX - (graphMargin - canvasSpacingUnit / 2),
          canvasY + canvasSpacingUnit / 2
        );
      }
    };

    // Method: Clear the graph
    const clearCanvas = context => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
    };

    // Setup graph resolution
    if (!hasSetup) {
      scaleCanvasResolution(context, current);
      setHasSetup(true);
    } else {
      descaleCanvasResolution(context, current);
      scaleCanvasResolution(context, current);
    }

    // Draw graph
    drawGraphAxes(context);
    if (!disabled) {
      drawGraph(context);
    }

    // Clean up
    return () => clearCanvas(context);
  }, [
    canvasHeight,
    canvasWidth,
    hasSetup,
    canvasResolutionScale,
    disabled,
    canvasSpacingUnit,
    values,
    averageValue,
    maxValue,
    minValue,
    activeX,
    activeY
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
