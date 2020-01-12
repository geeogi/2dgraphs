import { getPeriodAverageRenderMethod } from "./2DCanvasRenderMethod";
import { getInteractivityHandlers } from "./2DCanvasUtils/eventUtils";

export const drawGraph2DCanvas = (props: {
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
  canvasId: string;
  dateLabels: { label: string; unix: number }[];
  priceLabels: number[];
  positionLabels: (canvas: HTMLCanvasElement) => void;
  positionActiveLegend: (canvas: HTMLCanvasElement, activeX: number) => void;
  points: {
    x: number;
    y: number;
    price: number;
    dateTime: string;
  }[];
  xGridLines: number[];
  yGridLines: number[];
}) => {
  // Fetch render method
  const renderMethod = getPeriodAverageRenderMethod(props);

  // Define rendering React effect
  const canvasElement: HTMLCanvasElement = document.getElementById(
    props.canvasId
  ) as any;

  // Define resize method
  const onResize = () => {
    renderMethod({ canvasElement });
    props.positionLabels(canvasElement);
  };

  // Render on mount
  renderMethod({ canvasElement });
  props.positionLabels(canvasElement);

  // Attach resize listener
  window.addEventListener("resize", onResize);

  // Fetch interactivity event listeners
  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchMove,
    handleTouchStart
  } = getInteractivityHandlers(renderMethod);

  // Attach interactivity event listeners
  canvasElement.addEventListener("mousedown", handleMouseDown);
  canvasElement.addEventListener("mousemove", handleMouseMove);
  canvasElement.addEventListener("touchmove", handleTouchMove);
  canvasElement.addEventListener("touchstart", handleTouchStart);

  // Return cleanup function removes resize listener
  return () => {
    window.removeEventListener("resize", onResize);
    canvasElement.removeEventListener("mousedown", handleMouseDown);
    canvasElement.removeEventListener("mousemove", handleMouseMove);
    canvasElement.removeEventListener("touchmove", handleTouchMove);
    canvasElement.removeEventListener("touchstart", handleTouchStart);
  };
};
