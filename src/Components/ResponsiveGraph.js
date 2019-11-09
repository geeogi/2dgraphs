import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { PeriodAverage } from "./PeriodAverage";

const ResponsiveGraphBase = styled.div`
  min-height: 400px;
  min-width: 200px;
  width: 100%;
`;

export const ResponsiveGraph = props => {
  const [height, setHeight] = useState();
  const [width, setWidth] = useState();
  const container = useRef();

  useEffect(() => {
    const setDimensions = () => {
      if (container.current) {
        setHeight(container.current.offsetHeight);
        setWidth(container.current.offsetWidth);
      }
    };

    // Set dimensions on load
    if (container.current) {
      setDimensions();
    }

    // Set dimensions on resize
    window.addEventListener("resize", setDimensions);

    // Clean up
    return () => window.removeEventListener("resize", setDimensions);
  }, [height, width]);

  return (
    <ResponsiveGraphBase ref={container}>
      {height && width && (
        <PeriodAverage
          values={props.values}
          maxValue={props.maxValue}
          minValue={props.minValue}
          averageValue={props.averageValue}
          canvasHeight={height - 8}
          canvasWidth={width - 8}
        />
      )}
    </ResponsiveGraphBase>
  );
};
