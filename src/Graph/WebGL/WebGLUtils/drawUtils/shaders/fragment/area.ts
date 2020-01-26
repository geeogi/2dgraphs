import { glsl } from "../../../glslUtils";

export const AREA_FRAGMENT_SHADER = glsl`
  precision mediump float; 
  uniform vec4 uColor; 
  varying mediump float vY; 
  
  void main(void) { 
   gl_FragColor = uColor;
   gl_FragColor.a = gl_FragColor.a * ( ( vY + 1.0 ) / 2.0); 
  }`;
