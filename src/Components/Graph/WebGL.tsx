import React, { useEffect, useRef } from "react";
import { getDrawAreaMethod } from "../../WebGL/drawArea";
import { getDrawLineMethod } from "../../WebGL/drawLine";

export const WebGL = (props: {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  const canvasElementRef = useRef();

  const {
    averagePrice,
    earliestDate,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

  useEffect(() => {
    /*======= Creating a canvas =========*/

    var canvas: any = canvasElementRef.current;
    if (canvas) {
      // SETUP
      var gl = (canvas as any).getContext("webgl");

      var desiredCSSWidth = 1000;
      var desiredCSSHeight = 400;
      var devicePixelRatio = 2;

      canvas.width = desiredCSSWidth * devicePixelRatio;
      canvas.height = desiredCSSHeight * devicePixelRatio;

      canvas.style.width = desiredCSSWidth + "px";
      canvas.style.height = desiredCSSHeight + "px";

      // Clear the canvas
      gl.clearColor(0, 0, 0, 0);

      // Enable the depth test
      gl.enable(gl.DEPTH_TEST);

      // Clear the color and depth buffer
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Set the view port
      gl.viewport(0, 0, canvas.width, canvas.height);

      const linePoints: { x: number; y: number; z: number }[] = [];
      const areaPoints: { x: number; y: number; z: number }[] = [];

      values.forEach((value, index) => {
        const x = (index / values.length) * 2 - 1;
        const y = ((value.price - minPrice) / (maxPrice - minPrice)) * 2 - 1;
        const z = 0.5;
        linePoints.push({ x, y, z });
        areaPoints.push({ x, y, z });
        areaPoints.push({ x, y: -1, z });
      });

      getDrawLineMethod(gl, linePoints)();
      getDrawAreaMethod(gl, areaPoints)();
    }
  });

  return <canvas ref={canvasElementRef as any} />;
};
