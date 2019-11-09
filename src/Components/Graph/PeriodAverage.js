import React, { memo, useEffect, useRef, useState } from "react";

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

      // Color block: begin path
      context.beginPath();
      context.strokeStyle = "rgba(9,211,172,1)";

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
      values.forEach((value, index) => {
        const graphX = index * (graphWidth / (values.length - 1));
        const graphY = getY(value);
        context.lineTo(
          graphMargin + graphX,
          graphMargin + graphHeight - graphY
        );
        if (index === values.length - 1) {
          context.lineTo(
            graphMargin + graphWidth,
            graphMargin + graphHeight - graphY
          );
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
      values.forEach((value, index) => {
        const graphX = index * (graphWidth / (values.length - 1));
        const graphY = getY(value);
        context.lineTo(
          graphMargin + graphX,
          graphMargin + graphHeight - graphY
        );
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
    };

    //Method: Draw active region
    const drawActiveRegion = context => {
      context.fillRect(activeX, activeY, 50, 50);
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
    if (!disabled) {
      drawGraph(context);
      if (activeX && activeY) {
        drawActiveRegion(context);
      }
    }
    drawGraphAxes(context);

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
