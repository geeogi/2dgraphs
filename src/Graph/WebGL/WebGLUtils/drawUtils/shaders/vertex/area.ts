import { glsl } from "../../../glslUtils";

export const AREA_VERTEX_SHADER = glsl`
  uniform vec2 uScale; 
  uniform vec2 uTranslation; 
  attribute vec3 aVertex; 
  varying mediump float vY; 

  void main(void) {
   gl_Position = vec4(aVertex, 1.0); 
   gl_Position.xy = gl_Position.xy * uScale; 
   gl_Position.xy = gl_Position.xy + uTranslation; 
   vY = gl_Position.y; 
  }`;
