import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawCircleMethod = (
  gl: WebGLRenderingContext,
  circle: { x: number; y: number; r: number },
  color: number[],
  edgeColor: number[]
) => {
  const pointVShader = `
    precision mediump float;
    uniform float uSize; 
    uniform float uEdgeSize; 
    uniform vec2 uScale; 
    uniform vec2 uTranslation; 
    attribute vec3 aVertex; 
    void main(void) { 
     gl_Position = vec4(aVertex, 1.0); 
     gl_Position.xy = gl_Position.xy + uTranslation; 
     gl_Position.xy = gl_Position.xy * uScale; 
     gl_PointSize = uSize + uEdgeSize + 1.0;
    }`;

  const pointFShader = `
    precision mediump float;
    uniform float uSize;
    uniform float uEdgeSize;
    uniform vec4 uEdgeColor; 
    uniform vec4 uColor; 
    void main(void) { 
    // Calculate distance from center 
    float distance = length(2.0 * gl_PointCoord - 1.0); 
    
    // Set base color
    gl_FragColor = uColor; 
    
    // Calculate distance from edge
    float sEdge = smoothstep(
      uSize - uEdgeSize - 2.0,
      uSize - uEdgeSize,
      min(distance, 1.0) * (uSize + uEdgeSize)
    );
    
    // Blend between edge and body colors
    gl_FragColor = (uEdgeColor * sEdge) + ((1.0 - sEdge) * gl_FragColor);
    
    // Blend between edge and out colors (anti-aliasing)
    gl_FragColor.a = gl_FragColor.a * (1.0 - smoothstep(
      uSize - 2.0,
      uSize,
      min(distance, 1.0) * uSize
    ));

    // Discard fragments which lie outside of the circle
    gl_FragColor.a = distance > 1.0 ? 0.0 : gl_FragColor.a;
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
    const uColor = gl.getUniformLocation(pointProgram, "uColor");
    gl.uniform4fv(uColor, color);

    const uEdgeColor = gl.getUniformLocation(pointProgram, "uEdgeColor");
    gl.uniform4fv(uEdgeColor, edgeColor);

    const uScale = gl.getUniformLocation(pointProgram, "uScale");
    gl.uniform2fv(uScale, scale);

    const uTranslation = gl.getUniformLocation(pointProgram, "uTranslation");
    gl.uniform2fv(uTranslation, translation);

    const uEdgeSize = gl.getUniformLocation(pointProgram, "uEdgeSize");
    gl.uniform1f(uEdgeSize, 2);

    const uSize = gl.getUniformLocation(pointProgram, "uSize");
    gl.uniform1f(uSize, 25);

    // Draw the line
    gl.drawArrays(gl.POINTS, 0, 1);
  };
};
