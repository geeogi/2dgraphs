export const resizeGlCanvas = (
  gl: WebGLRenderingContext,
  width: number,
  height: number
) => {
  const canvas: HTMLCanvasElement = gl.canvas as any;
  const desiredCSSWidth = width;
  const desiredCSSHeight = height;
  const devicePixelRatio = window.devicePixelRatio;

  canvas.width = desiredCSSWidth * devicePixelRatio;
  canvas.height = desiredCSSHeight * devicePixelRatio;

  canvas.style.width = desiredCSSWidth + "px";
  canvas.style.height = desiredCSSHeight + "px";
};
