export const resizeGlCanvas = (
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const canvasResolutionScale = 4;
  canvasElement.style.width = width + "px";
  canvasElement.style.height = height + "px";
  canvasElement.width = width * canvasResolutionScale;
  canvasElement.height = height * canvasResolutionScale;
};
