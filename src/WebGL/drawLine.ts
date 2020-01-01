import { initProgram, initBuffer, bindBuffer } from "./setupUtils";

export const getDrawLineMethod = (
  gl: WebGL2RenderingContext,
  linePoints: { x: number; y: number; z: number }[]
) => {
  /*=================== Shaders ====================*/

  // Vertex shader source code
  var lineVShader =
    "attribute vec3 vertex;" +
    "attribute vec3 prev;" +
    "attribute vec3 next;" +
    "attribute vec2 offsetDirection;" +
    "void main(void) {" +
    " gl_Position = vec4(vertex, 1.0);" +
    " vec2 uScreen = vec2(1000.0,400.0);" +
    " vec2 AB = normalize(normalize(gl_Position.xy - prev.xy) * uScreen);" +
    " vec2 BC = normalize(normalize(next.xy - gl_Position.xy) * uScreen);" +
    " vec2 tangent = normalize(AB + BC);" +
    " vec2 miter = vec2(-tangent.y, tangent.x);" +
    " vec2 normalA = vec2(-AB.y, AB.x);" +
    " float miterLength = 1.0 / dot(miter, normalA);" +
    " gl_Position.xy = gl_Position.xy + (offsetDirection.x * miter * miterLength * 2.0) / uScreen.xy;" +
    "}";

  var lineFShader =
    "void main(void) {" + "gl_FragColor = vec4(0, 0, 1.0, 1);" + "}";

  // Create a shader program object to store the combined shader program
  const lineProgram = initProgram(gl, lineVShader, lineFShader);

  /*======= Defining the geometry ======*/

  const lineVertices: number[] = [];
  const prevVertices: number[] = [0, 0, 0, 0, 0, 0];
  const nextVertices: number[] = [];
  const offsetDirection: number[] = [];

  linePoints.forEach((point, index) => {
    const { x, y, z = 1 } = point;
    // Vertex
    lineVertices.push(x, y, z);
    lineVertices.push(x, y, z);
    // Prev
    prevVertices.push(x, y, z);
    prevVertices.push(x, y, z);
    // Next
    if (index > 0) {
      nextVertices.push(x, y, z);
      nextVertices.push(x, y, z);
    }
    // Offset direction
    offsetDirection.push(1, -1, 1, -1, 1, -1);
  });

  nextVertices.push(0, 0, 0, 0, 0, 0);

  /*======= Storing the geometry: vertex ======*/
  var lineVertices_buffer = initBuffer(gl, lineVertices);

  /*======= Storing the geometry: prev ======*/
  var prevVertices_buffer = initBuffer(gl, prevVertices);

  /*======= Storing the geometry: next ======*/
  var nextVertices_buffer = initBuffer(gl, nextVertices);

  /*======= Storing the geometry: offsetDirection ======*/
  var offsetDirection_buffer = initBuffer(gl, offsetDirection);

  return () => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    bindBuffer(gl, lineProgram, lineVertices_buffer, "vertex");

    /*======= Associating shaders to buffer objects: prev ======*/
    bindBuffer(gl, lineProgram, prevVertices_buffer, "prev");

    /*======= Associating shaders to buffer objects: next ======*/
    bindBuffer(gl, lineProgram, nextVertices_buffer, "next");

    /*======= Associating shaders to buffer objects: offsetDirection ======*/
    bindBuffer(gl, lineProgram, offsetDirection_buffer, "offsetDirection");

    /*============ Drawing the lines =============*/

    // Draw the lines
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, linePoints.length * 2);
  };
};
