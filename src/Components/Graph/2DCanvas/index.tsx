import { get2DCanvasLineGraphRenderMethod } from "./2DCanvasRenderMethod";

export const drawGraph2DCanvas = (props: {
  canvasElement: HTMLCanvasElement;
  xGridLines: number[];
  yGridLines: number[];
  points: {
    x: number;
    y: number;
    price: number;
    dateTime: string;
  }[];
}) => {
  // Extract props
  const { canvasElement, points, xGridLines, yGridLines } = props;

  // Fetch the canvas context
  const ctx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");

  if (!ctx) {
    throw new Error("Could not retrieve 2D canvas context");
  }

  // Initialize render method
  const render2DCanvasLineGraph = get2DCanvasLineGraphRenderMethod({
    canvasElement,
    ctx,
    xGridLines,
    yGridLines,
    points
  });

  // Render
  render2DCanvasLineGraph();

  // Return resize handler
  return () => render2DCanvasLineGraph();
};
