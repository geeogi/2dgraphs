import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawPointMethod = (
  gl: WebGLRenderingContext,
  circle: { x: number; y: number; r: number },
  rgba: string
) => {
  const pointVShader =
    "uniform vec2 uScale;" +
    "uniform vec2 uTranslation;" +
    "attribute vec3 aVertex;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.xy = gl_Position.xy + uTranslation;" +
    " gl_Position.xy = gl_Position.xy * uScale;" +
    " gl_PointSize = 20.0;" +
    "}";

  const pointFShader = `void main(void) { gl_FragColor = vec4${rgba}; }`;

  // Create a shader program object to store the combined shader program
  const pointProgram = initProgram(gl, pointVShader, pointFShader);

  // Upload buffers to GLSL
  const point_buffer = initArrayBuffer(gl, [circle.x, circle.y, 0]);

  return (
    resolution: [number, number],
    scale: [number, number] = [1, 1],
    translation: [number, number] = [0, 0]
  ) => {
    // Use the combined shader program object
    gl.useProgram(pointProgram);

    // Enable attributes
    enableAttribute(gl, pointProgram, point_buffer, "aVertex");

    // Enable uniforms
    const uScale = gl.getUniformLocation(pointProgram, "uScale");
    gl.uniform2fv(uScale, scale);

    const uTranslation = gl.getUniformLocation(pointProgram, "uTranslation");
    gl.uniform2fv(uTranslation, translation);

    // Draw the line
    gl.drawArrays(gl.POINTS, 0, 1);
  };
};
