export type GraphPoints = {
  x: number;
  y: number;
  price: number;
  dateTime: string;
  unix: number;
}[];

export type GraphResizeMethod = () => void;

export type GraphRescaleMethod = (
  minYValue: number,
  maxYValue: number,
  minXValue: number,
  maxXValue: number
) => GraphHandlers;

export type GraphHandlers = {
  resize: GraphResizeMethod;
  rescale?: GraphRescaleMethod;
};

export type GraphInitializeMethod = (args: {
  canvasElement: HTMLCanvasElement;
  points: GraphPoints;
  xGridLines: number[];
  yGridLines: number[];
  minYValue: number;
  maxYValue: number;
  minXValue: number;
  maxXValue: number;
}) => GraphHandlers;
