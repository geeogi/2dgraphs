export type GraphCleanupMethod = () => void;

export type GraphDrawingMethod = (args: {
  canvasElement: HTMLCanvasElement;
  points: { x: number; y: number; price: number; dateTime: string }[];
  xGridLines: number[];
  yGridLines: number[];
}) => GraphCleanupMethod;
