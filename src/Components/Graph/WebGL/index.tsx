import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../Universal/constants";
import { getRenderMethod } from "./WebGLRenderMethod";
import { getWebGLInteractivityHandlers } from "./WebGLUtils/eventUtils";

export const drawGraphWebGL = (props: {
  canvasElement: HTMLCanvasElement;
  xGridLines: number[];
  yGridLines: number[];
  points: {
    x: number;
    y: number;
    price: any;
    dateTime: any;
  }[];
  positionLabels: (canvas: HTMLCanvasElement) => void;
  positionActiveLegend: (
    canvas: HTMLCanvasElement,
    activeX: number | undefined
  ) => void;
}) => {
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Extract graph props
  const {
    canvasElement,
    xGridLines,
    yGridLines,
    points,
    positionLabels,
    positionActiveLegend
  } = props;

  const gl: WebGLRenderingContext | null = canvasElement.getContext("webgl");

  if (!gl) {
    throw new Error("Could not get WebGL context");
  }

  // Initialize GL render method
  const renderGLCanvas = getRenderMethod(
    {
      xGridLines,
      yGridLines,
      points
    },
    gl,
    margin
  );

  // Define method to be run on each render
  const renderGraph = (args?: { activeX?: number; activeY?: number }) => {
    // Extract render args
    const { activeX } = args || {};

    // Calculate canvas resolution
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];

    // Calculate graph width in px
    const graphWidth = resolution[0] - 2 * margin[0];

    // Position active legend
    positionActiveLegend(canvasElement, activeX);

    // Scale activeX to [-1,1] clip space
    const clipSpaceActiveX = activeX
      ? ((activeX - margin[0]) / graphWidth) * 2 - 1
      : undefined;

    // Call WebGL render method
    renderGLCanvas(resolution, clipSpaceActiveX);
  };

  // Define resize handler
  const onResize = () => {
    renderGraph();
    positionLabels(canvasElement);
  };

  // Attach event listener to render on resize event
  window.addEventListener("resize", onResize);

  // Fetch interactivity event listeners
  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchMove,
    handleTouchStart
  } = getWebGLInteractivityHandlers(renderGraph);

  // Attach interactivity event listeners
  canvasElement.addEventListener("mousedown", handleMouseDown);
  canvasElement.addEventListener("mousemove", handleMouseMove);
  canvasElement.addEventListener("touchmove", handleTouchMove);
  canvasElement.addEventListener("touchstart", handleTouchStart);

  // Render and position labels on page load
  renderGraph();
  positionLabels(canvasElement);

  // Return cleanup method
  return () => {
    window.removeEventListener("resize", onResize);
    canvasElement.removeEventListener("mousedown", handleMouseDown);
    canvasElement.removeEventListener("mousemove", handleMouseMove);
    canvasElement.removeEventListener("touchmove", handleTouchMove);
    canvasElement.removeEventListener("touchstart", handleTouchStart);
  };
};
