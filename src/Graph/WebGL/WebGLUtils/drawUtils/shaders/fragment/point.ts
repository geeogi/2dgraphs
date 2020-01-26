import { glsl } from "../../../vscodeUtils";

export const LINE_FRAGMENT_SHADER = glsl`precision mediump float;
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
