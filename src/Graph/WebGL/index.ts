import { GraphPoints } from "./../../types";
import { debounce } from "debounce";
import { getWebGLLineGraphRenderMethod } from "./WebGLRenderMethod";
import { resizeGlCanvas } from "./WebGLUtils/canvasUtils";

/**
 * Draws the primary path of the WebGL graph
 * @param args
 */
export const drawGraphWebGL = (args: {
  canvasElement: HTMLCanvasElement;
  points: GraphPoints;
  minYValue: number;
  maxYValue: number;
  minXValue: number;
  maxXValue: number;
}) => {
  // Extract render args
  const {
    canvasElement,
    points,
    minYValue,
    maxYValue,
    minXValue,
    maxXValue
  } = args;

  // Fetch WebGL context
  const gl: WebGLRenderingContext | null = canvasElement.getContext("webgl");

  if (!gl) {
    throw new Error("Could not retrieve WebGL context");
  }

  // Initialize render method
  const renderWebGLPath = getWebGLLineGraphRenderMethod(
    canvasElement,
    gl,
    points
  );

  // Size GL Canvas for retina displays
  resizeGlCanvas(gl, canvasElement);

  // Call WebGL render method
  renderWebGLPath();

  // Define debounced resize method (resizing WebGl canvas is slow ~20ms)
  const debouncedCanvasResize = debounce(
    (scale?: [number, number], translation?: [number, number]) => {
      resizeGlCanvas(gl, canvasElement);
      renderWebGLPath(scale, translation);
    },
    150
  );

  // Return graph handlers (resize and rescale)
  return {
    resize: () => {
      renderWebGLPath();
      debouncedCanvasResize();
    },
    rescale: (
      newMinYValue: number,
      newMaxYValue: number,
      newMinXValue: number,
      newMaxXValue: number
    ) => {
      // Scale
      const initXRange = maxXValue - minXValue;
      const newXRange = newMaxXValue - newMinXValue;
      const initYRange = maxYValue - minYValue;
      const newYRange = newMaxYValue - newMinYValue;
      const xScaleChange = initXRange / newXRange;
      const yScaleChange = initYRange / newYRange;
      const scale: [number, number] = [xScaleChange, yScaleChange];

      // Translation
      const yBaseChangeUp = newMinYValue - minYValue;
      const yBaseChangeDown = newMaxYValue - maxYValue;
      const yBaseChange = yBaseChangeUp + yBaseChangeDown;
      const scaledYBaseChange = -(yBaseChange / 2) * yScaleChange;
      const percentageYBaseChange = scaledYBaseChange / (maxYValue - minYValue);
      const clipSpaceYBaseChange = percentageYBaseChange * 2;
      const xTranslation = -(scale[0] - 1);
      const yTranslation = clipSpaceYBaseChange;
      const translation: [number, number] = [xTranslation, yTranslation];

      // Redraw the graph with new scale and translation
      renderWebGLPath(scale, translation);

      return {
        resize: () => {
          renderWebGLPath(scale, translation);
          debouncedCanvasResize(scale, translation);
        }
      };
    }
  };
};
