import { glsl } from "../../../glslUtils";

// https://github.com/d3fc/d3fc/blob/9decc02b958db6ec772073493da7bbbbd94407a7/packages/d3fc-webgl/src/shaders/vertexShaderSnippets.js#L148
// https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html

export const LINE_VERTEX_SHADER = glsl`
      uniform vec2 uResolution; 
      uniform vec2 uScale; 
      uniform vec2 uTranslation; 
      attribute vec2 aCorner; // Defines which corner in the line join we are considering
      attribute vec2 aCurrent; // Current vertex
      attribute vec2 aNext; // Next vertex
      attribute vec2 aPrev; // Previous vertex   

    void main(void) {
      vec2 uScreen = uResolution * uScale; // Used to normalize vectors
      gl_Position = vec4(aCurrent.x, aCurrent.y, 0, 1);
      float uLineWidth = 1.0;
      vec4 next = vec4(aNext.x, aNext.y, 0, 0);
      vec4 prev = vec4(aPrev.x, aPrev.y, 0, 0);

      if (all(equal(gl_Position.xy, prev.xy))) {
          prev.xy = gl_Position.xy + normalize(gl_Position.xy - next.xy);
      }

      if (all(equal(gl_Position.xy, next.xy))) {
          next.xy = gl_Position.xy + normalize(gl_Position.xy - prev.xy);
      }

      vec2 A = normalize(normalize(gl_Position.xy - prev.xy) * uScreen);
      vec2 B = normalize(normalize(next.xy - gl_Position.xy) * uScreen);
      vec2 tangent = normalize(A + B);
      vec2 miter = vec2(-tangent.y, tangent.x);
      vec2 normalA = vec2(-A.y, A.x);
      float miterLength = 1.0 / dot(miter, normalA);
      vec2 point = normalize(A - B);

      if (miterLength > 10.0 && sign(aCorner.x * dot(miter, point)) > 0.0) {
          gl_Position.xy = gl_Position.xy - (aCorner.x * aCorner.y * uLineWidth * normalA) / uScreen.xy;
      } else {
          gl_Position.xy = gl_Position.xy + (aCorner.x * miter * uLineWidth * miterLength) / uScreen.xy;
      }

      gl_Position.xy = gl_Position.xy * uScale;
      gl_Position.xy = gl_Position.xy + uTranslation;
    }`;
