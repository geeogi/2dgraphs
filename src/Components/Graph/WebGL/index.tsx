import moment from "moment";
import {
  ACTIVE_LEGEND,
  GRAPH_MARGIN_X,
  GRAPH_MARGIN_Y,
  SPACING_UNIT
} from "../constants";
import { clamp } from "../numberUtils";
import { getRenderMethod } from "./WebGLRenderMethod";
import { getWebGLInteractivityHandlers } from "./WebGLUtils/eventUtils";

const ACTIVE_LEGEND_WIDTH = ACTIVE_LEGEND.WIDTH;
const ACTIVE_LEGEND_ID = "active-legend";

export const drawGraphWebGL = (props: {
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
  canvasId: string;
  dateLabels: { label: string; unix: number }[];
  priceLabels: number[];
  xGridLines: number[];
  yGridLines: number[];
  points: {
    x: number;
    y: number;
    price: any;
    dateTime: any;
  }[];
  positionLabels: (canvas: HTMLCanvasElement) => void;
  positionActiveLegend: (canvas: HTMLCanvasElement, activeX: number) => void;
}) => {
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Extract graph props
  const {
    xGridLines,
    yGridLines,
    points,
    positionLabels,
    positionActiveLegend
  } = props;

  const canvasElement: HTMLCanvasElement = document.getElementById(
    props.canvasId
  ) as any;
  const gl: WebGLRenderingContext =
    canvasElement && (canvasElement.getContext("webgl") as any);

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

  // Define full render method
  const renderGraph = (args?: { activeX?: number; activeY?: number }) => {
    // Extract render args
    const { activeX } = args || {};

    // Calculate canvas resolution
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];

    // Calculate graph width and height in px
    const graphWidth = resolution[0] - 2 * margin[0];
    const graphHeight = resolution[1] - 2 * margin[1];

    // Scale activeX to [-1,1] clip space
    const clipSpaceActiveX = activeX
      ? ((activeX - margin[0]) / graphWidth) * 2 - 1
      : undefined;

    if (activeX) {
      positionActiveLegend(canvasElement, activeX);
    }

    // Call WebGL render method
    renderGLCanvas(resolution, clipSpaceActiveX);
  };

  // Define resize handler
  const onResize = () => {
    renderGraph();
    positionLabels(canvasElement); // Labels need repositioning on resize
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
