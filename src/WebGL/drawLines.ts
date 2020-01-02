import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawHorizontalLineMethod = (
  gl: WebGLRenderingContext,
  linePoints: { x: number; y: number; z?: number }[],
  rgba: string
) => {
  const lineVShader =
    "uniform vec2 uResolution;" +
    "attribute vec3 aVertex;" +
    "attribute vec2 aDirection;" +
    "void main(void) {" +
    " float aspect = uResolution.y / uResolution.x;" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.y = gl_Position.y + (aDirection.y * 2.0) / uResolution.y;" +
    "}";

  const lineFShader = `void main(void) { gl_FragColor = vec4${rgba}; }`;

  // Create a shader program object to store the combined shader program
  const lineProgram = initProgram(gl, lineVShader, lineFShader);

  // Calculate geometry
  const lineVertices: number[] = [];
  const direction: number[] = [];

  linePoints.forEach(point => {
    const { x, y, z = 0 } = point;
    // aVertex
    lineVertices.push(x, y, z);
    lineVertices.push(x, y, z);
    // Direction
    direction.push(1, -1, 1, -1, 1, -1);
  });

  // Upload buffers to GLSL
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const direction_buffer = initArrayBuffer(gl, direction);

  return (width: number, height: number) => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    // Enable attributes
    enableAttribute(gl, lineProgram, lineVertices_buffer, "aVertex");
    enableAttribute(gl, lineProgram, direction_buffer, "aDirection");

    // Set screen resolution
    const resolutionParam = gl.getUniformLocation(lineProgram, "uResolution");
    gl.uniform2fv(resolutionParam, [width, height]);

    // Draw the line
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, linePoints.length * 2);
  };
};
