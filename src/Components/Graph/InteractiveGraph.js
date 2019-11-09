import React, { useRef, useState } from "react";
import styled from "styled-components";

const InteractiveGraphBase = styled.div``;

export const InteractiveGraph = props => {
  const [activeX, setActiveX] = useState();
  const [activeY, setActiveY] = useState();
  const container = useRef();
  const { children } = props;

  const handleMouseMove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // x position within the element.
    setActiveX(x);
    setActiveY(y);
  };

  return (
    <InteractiveGraphBase ref={container} onMouseMove={handleMouseMove}>
      {children({ activeX, activeY })}
    </InteractiveGraphBase>
  );
};
