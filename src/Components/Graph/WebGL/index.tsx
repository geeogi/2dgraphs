import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../Universal/constants";
import { getRenderMethod } from "./WebGLRenderMethod";

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
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Extract graph props
  const { canvasElement, xGridLines, yGridLines, points } = props;

  const gl: WebGLRenderingContext | null = canvasElement.getContext("webgl");

  if (!gl) {
    throw new Error("Could not get WebGL context");
  }

  // Initialize GL render method
  const renderGLCanvas = getRenderMethod(
    canvasElement,
    {
      xGridLines,
      yGridLines,
      points
    },
    gl,
    margin
  );

  // Calculate canvas resolution
  const resolution: [number, number] = [
    canvasElement.offsetWidth,
    canvasElement.offsetHeight
  ];

  // Call WebGL render method
  renderGLCanvas(resolution);
};
