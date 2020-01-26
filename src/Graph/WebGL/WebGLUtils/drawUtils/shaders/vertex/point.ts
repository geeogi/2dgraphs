import { glsl } from "../../../vscodeUtils";

export const POINT_VERTEX_SHADER = glsl`
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
