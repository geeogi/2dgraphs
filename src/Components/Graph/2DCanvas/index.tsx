import { getPeriodAverageRenderMethod } from "./2DCanvasRenderMethod";

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
}) => {
  // Fetch render method
  const renderMethod = getPeriodAverageRenderMethod(props);

  // Extract props
  const { canvasElement } = props;

  // Render on mount
  renderMethod({ canvasElement });
};
