import React, { useRef, useState } from "react";
import styled from "styled-components";

const InteractiveGraphBase = styled.div``;

export const InteractiveGraph = props => {
  const [activeX, setActiveX] = useState();
  const [activeY, setActiveY] = useState();
  const [isClicked, setIsClicked] = useState();
  const container = useRef();
  const { children } = props;

  const handleMouseMove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // x position within the element.
    setActiveX(x);
    setActiveY(y);
  };

  const handleMouseLeave = () => {
    setActiveX();
    setActiveY();
  };

  const handleMouseDown = () => {
    setIsClicked(true);
    document.addEventListener("mouseup", () => {
      setIsClicked(false);
    });
  };

  const handleTouchStart = e => {
    const rect = e.target.getBoundingClientRect();
    const x = e.changedTouches[0].clientX - rect.left; // x position within the element.
    const y = e.changedTouches[0].clientY - rect.top; // x position within the element.
    setActiveX(x);
    setActiveY(y);
  };

  const handleTouchMove = handleTouchStart;

  const handleTouchEnd = () => {
    setActiveX();
    setActiveY();
  };

  return (
    <InteractiveGraphBase
      ref={container}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children({ activeX, activeY, isClicked })}
    </InteractiveGraphBase>
  );
};
