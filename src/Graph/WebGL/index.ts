import { debounce } from "debounce";
import { getWebGLLineGraphRenderMethod } from "./WebGLRenderMethod";
import { resizeGlCanvas } from "./WebGLUtils/canvasUtils";

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
  minPrice: number;
  maxPrice: number;
  minUnix: number;
  maxUnix: number;
}) => {
  // Extract graph props
  const {
    canvasElement,
    xGridLines,
    yGridLines,
    points,
    minPrice,
    maxPrice,
    minUnix,
    maxUnix
  } = props;

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
    points
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

  // Return handlers
  return {
    resize: () => {
      renderGLLineGraph();
      debouncedCanvasResize();
    },
    rescale: (
      newMinPrice: number,
      newMaxPrice: number,
      newMinUnix: number,
      newMaxUnix: number
    ) => {
      const xScaleChange = (maxUnix - minUnix) / (newMaxUnix - newMinUnix);
      const yScaleChange = (maxPrice - minPrice) / (newMaxPrice - newMinPrice);
      const up = newMinPrice - minPrice;
      const down = newMaxPrice - maxPrice;
      const diff = up + down;
      const change = -(diff / 2) * yScaleChange;
      const yBaseChange = change / (maxPrice - minPrice);
      const yBaseChangeClipSpace = yBaseChange * 2;

      const scale: [number, number] = [xScaleChange, yScaleChange];
      const translation: [number, number] = [
        -(scale[0] - 1),
        yBaseChangeClipSpace
      ];

      renderGLLineGraph(scale, translation);
    }
  };
};
