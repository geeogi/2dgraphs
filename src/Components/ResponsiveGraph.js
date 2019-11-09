import React, { useEffect, useRef, useState } from "react";
import { PeriodAverage } from "./PeriodAverage";

export const ResponsiveGraph = props => {
  const [height, setHeight] = useState();
  const [width, setWidth] = useState();
  const container = useRef();

  useEffect(() => {
    if (container.current) {
      setHeight(container.current.offsetHeight);
      setWidth(container.current.offsetWidth);
    }
  }, [height, width]);

  return (
    <div ref={container} style={{ width: "100%" }}>
      {height && width && (
        <PeriodAverage
          values={props.values}
          maxValue={props.maxValue}
          minValue={props.minValue}
          averageValue={props.averageValue}
          canvasHeight={height}
          canvasWidth={width}
        />
      )}
    </div>
  );
};
