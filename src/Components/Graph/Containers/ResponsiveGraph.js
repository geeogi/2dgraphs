import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const ResponsiveGraphBase = styled.div`
  min-height: 400px;
  min-width: 200px;
  width: 100%;
`;

export const ResponsiveGraph = props => {
  const [height, setHeight] = useState();
  const [width, setWidth] = useState();
  const container = useRef();
  const { children } = props;

  useEffect(() => {
    // Grab the dimensions of this element
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

    // Remove event listener on element destroy
    return () => window.removeEventListener("resize", setDimensions);
  }, [height, width]);

  return (
    <ResponsiveGraphBase ref={container}>
      {height && width && children({ height, width })}
    </ResponsiveGraphBase>
  );
};
