import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

const glsl = (x: any) => x;

export const getDrawPointMethod = (
  gl: WebGLRenderingContext,
  circle: { x: number; y: number; r: number },
  rgba: string
) => {
  const pointVShader = glsl`
    uniform vec2 uScale; 
    uniform vec2 uTranslation; 
    attribute vec3 aVertex; 
    varying vec2 center; 
    void main(void) { 
     gl_Position = vec4(aVertex, 1.0); 
     gl_Position.xy = gl_Position.xy + uTranslation; 
     gl_Position.xy = gl_Position.xy * uScale; 
     gl_PointSize = 30.0; 
     center = vec2(gl_Position); 
    }`;

  const pointFShader = glsl`
    precision mediump float;
    varying vec2 center; 
    void main(void) { 
    gl_FragColor = vec4(0,0,1.0,1.0); 
    float distance = length(2.0 * gl_PointCoord - 1.0);
    gl_FragColor.a = distance > 0.9 ? 0.0 : 1.0;
    gl_FragColor = distance < 1.0 && distance > 0.9 ? vec4(1.0,1.0,1.0,1.0) : gl_FragColor;
    }`;

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

    console.log(translation);
    // Draw the line
    gl.drawArrays(gl.POINTS, 0, 1);
  };
};
