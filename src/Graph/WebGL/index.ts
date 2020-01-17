import { debounce } from "debounce";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../Universal/constants";
import { getWebGLLineGraphRenderMethod } from "./WebGLRenderMethod";
import { resizeGlCanvas } from "./WebGLUtils/canvasUtils";

const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

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
}) => {
  // Extract graph props
  const { canvasElement, xGridLines, yGridLines, points } = props;

  // Fetch WebGL context
  const gl: WebGLRenderingContext | null = canvasElement.getContext("webgl");

  if (!gl) {
    throw new Error("Could not get WebGL context");
  }

  // Initialize render method
  const renderGLLineGraph = getWebGLLineGraphRenderMethod(
    canvasElement,
    gl,
    xGridLines,
    yGridLines,
    points,
    margin
  );

  // Size GL Canvas for retina displays
  resizeGlCanvas(gl, canvasElement);

  // Call WebGL render method
  renderGLLineGraph();

  // Define debounced resize method (resizing WebGl canvas is slow ~20ms)
  const debouncedCanvasResize = debounce(() => {
    resizeGlCanvas(gl, canvasElement);
    renderGLLineGraph();
  }, 100);

  // Return resize handler
  return () => {
    renderGLLineGraph();
    debouncedCanvasResize();
  };
};
