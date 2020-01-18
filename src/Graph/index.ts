import { GraphDrawingMethod } from "../types";
import { getInteractivityHandlers } from "./Universal/eventUtils";
import { getGraphConfig } from "./Universal/getGraphConfig";
import { positionActiveLegend } from "./Universal/positionActiveLegend";
import { positionLabels } from "./Universal/positionLabels";

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
    margin,
    minPrice,
    maxPrice,
    minUnix,
    maxUnix
  } = getGraphConfig([...values], noOfDataPoints);

  // Define method to be called on graph interaction
  const onInteraction = (args: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => positionActiveLegend(canvas, args.activeX, margin, points);

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
  } = getInteractivityHandlers(onInteraction); // @TODO

  // Draw the graph
  const { resize: onPathResize, rescale: onPathRescale } = drawingMethod({
    canvasElement: canvas,
    points,
    xGridLines,
    yGridLines,
    minPrice,
    maxPrice,
    minUnix,
    maxUnix
  });

  // Define resize handler
  const onResize = () => {
    onInteraction({});
    onPathResize();
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
  window.addEventListener("resize", onResize, { passive: true });
  canvas.addEventListener("mousedown", handleMouseDown, { passive: true });
  canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
  canvas.addEventListener("touchstart", handleTouchStart, { passive: true });

  // Remove event listeners during cleanup
  cleanup = () => {
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchstart", handleTouchStart);
  };

  return {
    rescale: onPathRescale
      ? (noOfDataPoints: number) => {
          // Get graph configuration
          const {
            priceLabels,
            dateLabels,
            xGridLines,
            yGridLines,
            points,
            margin,
            minPrice,
            maxPrice,
            minUnix,
            maxUnix
          } = getGraphConfig([...values], noOfDataPoints);

          // Define method to be called on graph interaction
          const onInteraction = (args: {
            activeX?: number;
            activeY?: number;
            isClicked?: boolean;
          }) => positionActiveLegend(canvas, args.activeX, margin, points);

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

          // Rescale the graph
          onPathRescale(minPrice, maxPrice, minUnix, maxUnix);
        }
      : undefined
  };
};
