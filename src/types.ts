export type GraphResizeMethod = () => void;

export type GraphPoints = {
  x: number;
  y: number;
  price: number;
  dateTime: string;
}[];

export type GraphDrawingMethod = (args: {
  canvasElement: HTMLCanvasElement;
  points: GraphPoints;
  xGridLines: number[];
  yGridLines: number[];
  minPrice?: number;
  maxPrice?: number;
  minUnix?: number;
  maxUnix?: number;
}) => {
  resize: GraphResizeMethod;
  rescale?: (
    newMinPrice: number,
    newMaxPrice: number,
    newMinUnix: number,
    newMaxUnix: number
  ) => void;
};
