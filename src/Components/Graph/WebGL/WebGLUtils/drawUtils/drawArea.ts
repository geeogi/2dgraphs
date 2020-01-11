import { enableAttribute, initArrayBuffer, initProgram } from "../setupUtils";

let areaProgram: WebGLProgram;
let marginResolution: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawAreaMethod = (
  gl: WebGLRenderingContext,
  areaPoints: { x: number; y: number; z?: number }[],
  color: number[]
) => {
  // Vertex shader source code
  var areaVShader =
    "uniform vec2 uMargin;" +
    "attribute vec3 aVertex;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.xy = gl_Position.xy * uMargin;" +
    " vY = gl_Position.y;" +
    "}";

  // Fragment shader source code
  var areaFShader =
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

    // Fetch uniform locations
    marginResolution = gl.getUniformLocation(areaProgram, "uMargin");
    colorUniform = gl.getUniformLocation(areaProgram, "uColor");
  }

  /*======= Defining the geometry ======*/
  const fillAreaVertices: number[] = [];
  areaPoints.forEach(point => {
    const { x, y, z = 0 } = point;
    fillAreaVertices.push(x, y, z);
  });

  /*======= Storing the geometry ======*/
  var fillAreaVertices_buffer = initArrayBuffer(gl, fillAreaVertices);

  return (resolution: [number, number], margin: [number, number]) => {
    // Use the combined shader program object
    gl.useProgram(areaProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    enableAttribute(gl, areaProgram, fillAreaVertices_buffer, "aVertex");

    // Enable uniforms
    gl.uniform2fv(marginResolution, margin);
    gl.uniform4fv(colorUniform, color);

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
