import { enable2DAttribute, initArrayBuffer, initProgram } from "../setupUtils";
import { AREA_FRAGMENT_SHADER } from "./shaders/fragment/area";
import { AREA_VERTEX_SHADER } from "./shaders/vertex/area";

let areaProgram: WebGLProgram;
let scaleUniform: WebGLUniformLocation | null;
let translationUniform: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawAreaMethod = (
  gl: WebGLRenderingContext,
  areaPoints: { x: number; y: number }[],
  color: number[]
) => {
  // Setup and cache the program and uniform locations
  if (!areaProgram) {
    areaProgram = initProgram(gl, AREA_VERTEX_SHADER, AREA_FRAGMENT_SHADER);
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
    enable2DAttribute(gl, areaProgram, fillAreaVertices_buffer, "aVertex");

    // Enable uniforms
    gl.uniform2fv(scaleUniform, scale);
    gl.uniform2fv(translationUniform, translation);
    gl.uniform4fv(colorUniform, color);

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
