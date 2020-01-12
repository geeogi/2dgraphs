import { getPeriodAverageRenderMethod } from "./2DCanvasRenderMethod";
import { getInteractivityHandlers } from "./2DCanvasUtils/eventUtils";

export const drawGraph2DCanvas = (props: {
  canvasElement: HTMLCanvasElement;
  points: {
    x: number;
    y: number;
    price: number;
    dateTime: string;
  }[];
  xGridLines: number[];
  yGridLines: number[];
  onRender: (canvas: HTMLCanvasElement) => void;
  onInteraction: (
    canvas: HTMLCanvasElement,
    activeX: number | undefined
  ) => void;
}) => {
  // Fetch render method
  const renderMethod = getPeriodAverageRenderMethod(props);

  // Extract props
  const { canvasElement } = props;

  // Define resize method
  const onResize = () => {
    renderMethod({ canvasElement });
    props.onRender(canvasElement);
  };

  // Render on mount
  renderMethod({ canvasElement });
  props.onRender(canvasElement);

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
