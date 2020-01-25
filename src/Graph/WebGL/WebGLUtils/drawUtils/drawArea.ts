import { enableAttribute, initArrayBuffer, initProgram } from "../setupUtils";

let areaProgram: WebGLProgram;
let scaleUniform: WebGLUniformLocation | null;
let translationUniform: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawAreaMethod = (
  gl: WebGLRenderingContext,
  areaPoints: { x: number; y: number; z?: number }[],
  color: number[]
) => {
  // Vertex shader source code
  const areaVShader =
    "uniform vec2 uScale;" +
    "uniform vec2 uTranslation;" +
    "attribute vec3 aVertex;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.xy = gl_Position.xy * uScale;" +
    " gl_Position.xy = gl_Position.xy + uTranslation;" +
    " vY = gl_Position.y;" +
    "}";

  // Fragment shader source code
  const areaFShader =
    "precision mediump float;" +
    "uniform vec4 uColor;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    ` gl_FragColor = uColor;` +
    " gl_FragColor.a = gl_FragColor.a * ((vY+1.0)/2.0);" +
    "}";

  // Setup and cache the program and uniform locations
  if (!areaProgram) {
    areaProgram = initProgram(gl, areaVShader, areaFShader);
    scaleUniform = gl.getUniformLocation(areaProgram, "uScale");
    translationUniform = gl.getUniformLocation(areaProgram, "uTranslation");
    colorUniform = gl.getUniformLocation(areaProgram, "uColor");
  }

  /*======= Defining the geometry ======*/
  const fillAreaVertices: number[] = [];
  areaPoints.forEach(point => {
    const { x, y } = point;
    fillAreaVertices.push(x, y);
  });

  /*======= Storing the geometry ======*/
  const fillAreaVertices_buffer = initArrayBuffer(gl, fillAreaVertices);

  return (
    resolution: [number, number],
    scale: [number, number] = [1, 1],
    translation: [number, number] = [0, 0]
  ) => {
    // Use the combined shader program object
    gl.useProgram(areaProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    enableAttribute(gl, areaProgram, fillAreaVertices_buffer, "aVertex");

    // Enable uniforms
    gl.uniform2fv(scaleUniform, scale);
    gl.uniform2fv(translationUniform, translation);
    gl.uniform4fv(colorUniform, color);

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
