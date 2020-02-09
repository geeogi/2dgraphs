import { GraphHandlers } from "../types";
import { drawGraph2DCanvas } from "./2DCanvas/index";
import { addInteractivityHandlers } from "./Universal/eventUtils";
import { getGraphConfig } from "./Universal/getGraphConfig";
import { positionActiveLegend } from "./Universal/positionActiveLegend";
import { positionLabels } from "./Universal/positionLabels";
import { addResizeHandler } from "./Universal/resize";

/**
 * Initialize the 2D Canvas graph
 * Returns a method that can be used to redraw the graph
 * @param canvasElement
 * @param values
 */
export const initialize2DCanvasGraph = (
  canvasElement: HTMLCanvasElement,
  values: { dateTime: number; price: number }[]
) => {
  /**
   * Draws the graph
   * Positions the graph labels
   * Attaches event listeners (window resize and interaction)
   * @param initGraph
   * @param rescaleGraph
   * @param newNoOfDataPoints
   */
  const drawGraph = (args: {
    values?: { dateTime: number; price: number }[];
  }) => {
    // Extract render arguments
    const { values } = args;

    // Get graph configuration
    const {
      priceLabels,
      dateLabels,
      xGridLines,
      yGridLines,
      points,
      margin
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

    // Draw the primary path
    const { resize }: GraphHandlers = drawGraph2DCanvas({
      canvasElement,
      points
    });

    // Define resize handler: clear legend, resize path, position labels
    const onResize = () => {
      resize();
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
  };

  // Draw the graph
  drawGraph({ values });

  // Return a method to redraw the graph with a given number of points
  return (noOfPoints: number) => {
    const start = values.length - noOfPoints;
    const end = values.length;
    const newValues = values.slice(start, end);
    drawGraph({ values: newValues });
  };
};
