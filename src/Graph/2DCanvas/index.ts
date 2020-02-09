import { GraphPoints } from "./../../types";
import { get2DCanvasLineGraphRenderMethod } from "./2DCanvasRenderMethod";
import { scale2DCanvas } from "./2DCanvasUtils/canvasUtils";

/**
 * Draws the primary path of the 2D Canvas graph
 * @param args
 */
export const drawGraph2DCanvas = (args: {
  canvasElement: HTMLCanvasElement;
  points: GraphPoints;
}) => {
  // Extract props
  const { canvasElement, points } = args;

  // Fetch the canvas context
  const ctx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");

  if (!ctx) {
    throw new Error("Could not retrieve 2D canvas context");
  }

  // Initialize render method
  const render2DCanvasPath = get2DCanvasLineGraphRenderMethod({
    canvasElement,
    ctx,
    points
  });

  // Scale 2D Canvas for retina displays
  scale2DCanvas(ctx, canvasElement);

  // Render
  render2DCanvasPath();

  // Return resize handler
  return {
    resize: () => {
      scale2DCanvas(ctx, canvasElement);
      render2DCanvasPath();
    }
  };
};
