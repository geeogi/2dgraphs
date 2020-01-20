import {
  GraphHandlers,
  GraphInitializeMethod,
  GraphRescaleMethod
} from "../types";
import { GraphPoints } from "./../types";
import { addInteractivityHandlers } from "./Universal/eventUtils";
import { getGraphConfig } from "./Universal/getGraphConfig";
import { positionActiveLegend } from "./Universal/positionActiveLegend";
import { positionLabels } from "./Universal/positionLabels";
import { addResizeHandler } from "./Universal/resize";

/**
 * Initializes the drawing method (WebGl or 2DCanvas)
 * Positions the graph labels
 * Attaches event listeners (resize and interaction)
 * Returns rescale method which can used to redraw the graph
 * @param canvasElement
 * @param initGraphMethod
 * @param initNoOfDataPoints
 * @param values
 */
export const initializeGraph = (
  canvasElement: HTMLCanvasElement,
  initGraphMethod: GraphInitializeMethod,
  values: { dateTime: number; price: number }[]
) => {
  /**
   * Initializes or rescales the graph
   * Positions the graph labels
   * Attaches event listeners (resize and interaction)
   * @param initGraph
   * @param rescaleGraph
   * @param newNoOfDataPoints
   */
  const drawGraph = (args: {
    initGraph?: GraphInitializeMethod;
    initValues?: { dateTime: number; price: number }[];
    rescaleGraph?: GraphRescaleMethod;
  }) => {
    // Extract render arguments
    const { initGraph, initValues, rescaleGraph } = args;

    // Get graph configuration with desired number of data points
    const {
      priceLabels,
      dateLabels,
      xGridLines,
      yGridLines,
      points,
      margin,
      minYValue,
      maxYValue,
      minXValue,
      maxXValue
    } = getGraphConfig({ initValues });

    // Define method to be called on graph interaction
    const onInteraction = (args: {
      activeX?: number;
      activeY?: number;
      isClicked?: boolean;
    }) => positionActiveLegend(canvasElement, args.activeX, margin, points);

    // Position graph labels
    positionLabels(
      canvasElement,
      dateLabels,
      priceLabels,
      xGridLines,
      yGridLines,
      margin
    );

    // Clear interactive legend
    onInteraction({});

    // Draw or rescale the path
    const graphHandlers: GraphHandlers = rescaleGraph
      ? rescaleGraph(minYValue, maxYValue, minXValue, maxXValue)
      : initGraph({
          canvasElement,
          points,
          xGridLines,
          yGridLines,
          minYValue,
          maxYValue,
          minXValue,
          maxXValue
        });

    // Define resize handler: clear legend, resize path, position labels
    const onResize = () => {
      graphHandlers.resize();
      onInteraction({});
      positionLabels(
        canvasElement,
        dateLabels,
        priceLabels,
        xGridLines,
        yGridLines,
        margin
      );
    };

    // Attach event listeners
    addResizeHandler(onResize);
    addInteractivityHandlers(onInteraction, canvasElement);

    // Return graph handlers
    return { graphHandlers, points };
  };

  // Draw the graph and fetch the graph handlers
  const { graphHandlers, points } = drawGraph({
    initGraph: initGraphMethod,
    initValues: values
  });
  const { rescale } = graphHandlers;

  // Define a method which can be used to reinitialize the graph
  const onReinitialize = (noOfPoints: number) => {
    const newValues = values.slice(values.length - noOfPoints, values.length);
    drawGraph({ initGraph: initGraphMethod, initValues: newValues });
  };

  // Define a rescale method which can be used to redraw the graph
  // (Note: only the WebGL graph can be rescaled without re-initializing)
  const onRescale = rescale
    ? (noOfPoints: number) => {
        const newValues = values.slice(
          values.length - noOfPoints,
          values.length
        );
        drawGraph({ rescaleGraph: rescale, initValues: newValues });
      }
    : onReinitialize;

  return { onRescale };
};
