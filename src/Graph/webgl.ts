import { GraphHandlers, GraphRescaleMethod } from "../types";
import { addInteractivityHandlers } from "./Universal/eventUtils";
import { getGraphConfig } from "./Universal/getGraphConfig";
import { positionActiveLegend } from "./Universal/positionActiveLegend";
import { positionLabels } from "./Universal/positionLabels";
import { addResizeHandler } from "./Universal/resize";
import { drawGraphWebGL } from "./WebGL/index";

/**
 * Initialize the WebGL graph
 * Returns a method that can be used to redraw the graph
 * @param canvasElement
 * @param values
 */
export const initializeWebGLGraph = (
  canvasElement: HTMLCanvasElement,
  initValues: { dateTime: number; price: number }[]
) => {
  /**
   * Draws the graph
   * Will initialize the WebGL path if no rescaleGraph method is available
   * Will rescale the existing WebGL path if a rescaleGraph method is available
   * Positions the graph labels
   * Attaches event listeners (window resize and interaction)
   * @param values
   * @param rescaleGraph
   */
  const drawGraph = (args: {
    values?: { dateTime: number; price: number }[];
    rescaleGraph?: GraphRescaleMethod;
  }) => {
    // Extract render arguments
    const { values, rescaleGraph } = args;

    // Get graph configuration
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
    } = getGraphConfig({ values });

    // Define method to be called on graph interaction
    const onInteraction = (args: {
      activeX?: number;
      activeY?: number;
      isClicked?: boolean;
    }) => {
      positionActiveLegend(canvasElement, args.activeX, margin, points);
    };

    // Position graph labels
    positionLabels(
      canvasElement,
      dateLabels,
      priceLabels,
      xGridLines,
      yGridLines,
      margin
    );

    // Reset interaction state
    onInteraction({});

    // Draw or rescale the primary path
    const graphHandlers: GraphHandlers = rescaleGraph
      ? rescaleGraph(minYValue, maxYValue, minXValue, maxXValue)
      : drawGraphWebGL({
          canvasElement,
          points,
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
    return { graphHandlers };
  };

  // Draw the graph and fetch the graph handlers
  const { graphHandlers } = drawGraph({ values: initValues });
  const { rescale } = graphHandlers;

  // Return a method to redraw the graph with a given number of points
  return (noOfPoints: number) => {
    const start = initValues.length - noOfPoints;
    const end = initValues.length;
    const newValues = initValues.slice(start, end);
    drawGraph({ rescaleGraph: rescale, values: newValues });
  };
};
