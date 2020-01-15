import { GraphDrawingMethod } from "../types";
import { getGraphConfig } from "./Universal/getGraphConfig";
import { positionActiveLegend } from "./Universal/positionActiveLegend";
import { positionLabels } from "./Universal/positionLabels";
import { getWebGLInteractivityHandlers } from "./WebGL/WebGLUtils/eventUtils";

// Declare cache for cleanup to be called before re-render
let cleanup: () => void;

/**
 * Triggers the drawing method, positions the labels and attaches event listeners
 * @param canvas
 * @param drawingMethod
 * @param noOfDataPoints
 * @param values
 */
export const drawGraph = (
  canvas: HTMLCanvasElement,
  drawingMethod: GraphDrawingMethod,
  noOfDataPoints: number,
  values: { dateTime: string; price: number }[]
) => {
  // Call clean up function if applicable
  if (cleanup) {
    cleanup();
  }

  // Get graph configuration
  const {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin
  } = getGraphConfig([...values], noOfDataPoints);

  // Define method to be called on graph interaction
  const onInteraction = (args: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => positionActiveLegend(canvas, args.activeX, margin, points);

  // Draw the graph
  const onGraphResize = drawingMethod({
    canvasElement: canvas,
    points,
    xGridLines,
    yGridLines
  });

  // Position graph labels
  positionLabels(
    canvas,
    dateLabels,
    priceLabels,
    xGridLines,
    yGridLines,
    margin
  );

  // Clear interactive legend
  onInteraction({});

  // Fetch interactivity event listeners
  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchMove,
    handleTouchStart
  } = getWebGLInteractivityHandlers(onInteraction); // @TODO

  // Define resize handler
  const onResize = () => {
    onInteraction({});
    onGraphResize();
    positionLabels(
      canvas,
      dateLabels,
      priceLabels,
      xGridLines,
      yGridLines,
      margin
    );
  };

  // Attach event listeners
  window.addEventListener("resize", onResize);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchstart", handleTouchStart);

  // Remove event listeners during cleanup
  cleanup = () => {
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchstart", handleTouchStart);
  };
};
