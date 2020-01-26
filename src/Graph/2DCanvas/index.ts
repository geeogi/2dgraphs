import { GraphPoints } from "./../../types";
import { get2DCanvasLineGraphRenderMethod } from "./2DCanvasRenderMethod";
import { scale2DCanvas } from "./2DCanvasUtils/canvasUtils";

export const drawGraph2DCanvas = (props: {
  canvasElement: HTMLCanvasElement;
  points: GraphPoints;
}) => {
  // Extract props
  const { canvasElement, points } = props;

  // Fetch the canvas context
  const ctx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");

  if (!ctx) {
    throw new Error("Could not retrieve 2D canvas context");
  }

  // Initialize render method
  const render2DCanvasLineGraph = get2DCanvasLineGraphRenderMethod({
    canvasElement,
    ctx,
    points
  });

  // Size 2D Canvas for retina displays
  scale2DCanvas(ctx, canvasElement);

  // Render
  render2DCanvasLineGraph();

  // Return resize handler
  return {
    resize: () => {
      scale2DCanvas(ctx, canvasElement);
      render2DCanvasLineGraph();
    }
  };
};
