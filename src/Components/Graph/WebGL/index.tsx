import { debounce } from "debounce";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../Universal/constants";
import { getWebGLLineGraphRenderMethod } from "./WebGLRenderMethod";
import { resizeGlCanvas } from "./WebGLUtils/canvasUtils";

const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

// To be called when the graph is first rendered and each time the data changes
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

  // Resize GL Canvas
  resizeGlCanvas(gl, canvasElement);

  // Call WebGL render method
  renderGLLineGraph();

  // Return debounced resize handler (resizing WebGl canvas is slow ~20ms)
  return debounce(() => {
    resizeGlCanvas(gl, canvasElement);
    renderGLLineGraph();
  }, 100);
};
