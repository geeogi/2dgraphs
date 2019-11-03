import React, { memo, useEffect, useRef, useState } from "react";

const PeriodAverageBase = props => {
  const [hasSetup, setHasSetup] = useState();

  // Element: the <canvas> element
  const canvasElement = useRef();

  // Props
  const {
    disabled = false,
    canvasWidth = 1000,
    canvasDepth = 400,
    canvasResolutionScale = 4,
    canvasSpacingUnit = 8,
    graphMargin = 8 * 5,
    graphWidth = 920,
    graphDepth = 320,
    values,
    averageValue,
    minValue,
    maxValue
  } = props;

  useEffect(() => {
    // Method: Scale canvas resolution for retina displays
    const scaleCanvasResolution = context => {
      current.style.width = canvasWidth + "px";
      current.style.height = canvasDepth + "px";
      current.width = canvasWidth * 4;
      current.height = canvasDepth * 4;
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
      context.font = "20px Arial";

      // Draw x-axis
      context.moveTo(graphMargin, graphDepth + graphMargin);
      context.lineTo(graphWidth + graphMargin, graphDepth + graphMargin);

      // Draw y-axis
      context.moveTo(graphMargin, graphMargin);
      context.lineTo(graphMargin, graphDepth + graphMargin);

      // Add x-axis labels
      context.textAlign = "center";

      // Add graph title
      context.fillText(
        "Period average",
        canvasWidth / 2,
        graphMargin - canvasSpacingUnit
      );

      context.stroke();
    };

    // Method: Draw graph
    const drawGraph = context => {
      const normalise = value => value - minValue;
      const getYFactor = value => normalise(value) / normalise(maxValue);
      const getY = value => getYFactor(value) * graphDepth;
      const averageY = getY(averageValue);

      // Color block: begin path
      context.beginPath();
      context.strokeStyle = "rgba(9,211,172,1)";

      // Color block: create gradient
      var gradient = context.createLinearGradient(
        0,
        graphMargin,
        0,
        graphMargin + graphDepth
      );
      gradient.addColorStop(0, "rgba(9,211,172,0.4)");
      gradient.addColorStop(1 - getYFactor(averageValue), "rgba(9,211,172,0)");
      context.fillStyle = gradient;

      // Color block: draw, stroke and fill path
      values.forEach((value, index) => {
        const graphX = index * (graphWidth / (values.length - 1));
        const graphY = getY(value);
        context.lineTo(graphMargin + graphX, graphMargin + graphDepth - graphY);
        if (index === values.length - 1) {
          context.lineTo(
            graphMargin + graphWidth,
            graphMargin + graphDepth - graphY
          );
          context.lineTo(graphMargin + graphWidth, graphMargin + graphDepth);
        }
      });
      context.stroke();
      context.fill();

      // Color block: clear block underneath the average line
      context.clearRect(
        graphMargin,
        graphMargin + graphDepth - averageY,
        graphWidth + 1,
        averageY
      );
      context.clearRect(
        graphMargin + graphWidth - 1,
        graphMargin,
        2,
        graphDepth
      );

      // Color block: save color block for later
      const blockImageData = context.getImageData(
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin, // y
        canvasResolutionScale * graphWidth, // w
        canvasResolutionScale * (graphDepth - averageY) // h
      );

      // Clear graph
      context.clearRect(graphMargin, graphMargin, graphWidth, graphDepth);

      // Draw dashed path
      context.setLineDash([5, 5]);
      context.beginPath();
      values.forEach((value, index) => {
        const graphX = index * (graphWidth / (values.length - 1));
        const graphY = getY(value);
        context.lineTo(graphMargin + graphX, graphMargin + graphDepth - graphY);
      });
      context.stroke();

      // Clear dashed path above the average line
      context.clearRect(
        graphMargin,
        graphMargin,
        graphWidth,
        graphDepth - averageY
      );

      // Draw average line
      context.setLineDash([]);
      context.strokeStyle = "rgba(9,211,172,1)";
      context.lineWidth = 2;
      context.beginPath();
      const graphY = averageY;
      context.moveTo(graphMargin, graphMargin + graphDepth - graphY);
      context.lineTo(
        graphMargin + graphWidth,
        graphMargin + graphDepth - graphY
      );
      context.stroke();

      // Re-add the color block
      context.putImageData(
        blockImageData,
        canvasResolutionScale * graphMargin, // x
        canvasResolutionScale * graphMargin // y
      );
    };

    // Method: Clear the graph
    const clearCanvas = context => {
      context.clearRect(0, 0, canvasWidth, canvasDepth);
    };

    // Fetch canvas context
    const { current } = canvasElement;
    const context = current.getContext("2d");

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
    }
    drawGraphAxes(context);

    // Clean up
    return () => clearCanvas(context);
  }, [
    hasSetup,
    canvasResolutionScale,
    disabled,
    graphMargin,
    graphDepth,
    graphWidth,
    canvasWidth,
    canvasDepth,
    canvasSpacingUnit,
    values,
    averageValue
  ]);

  return (
    <canvas
      name="frequency"
      ref={canvasElement}
      width={canvasWidth + "px"}
      height={canvasDepth + "px"}
    />
  );
};

export const PeriodAverage = memo(PeriodAverageBase);
