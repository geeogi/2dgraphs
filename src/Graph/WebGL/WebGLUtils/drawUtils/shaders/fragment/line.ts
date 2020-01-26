import { glsl } from "../../../glslUtils";

export const LINE_FRAGMENT_SHADER = glsl`
precision mediump float;
uniform vec4 uColor; 
void main(void) { 
  gl_FragColor = uColor; 
}`;
