import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const InteractiveGraphBase = styled.div``;

export const InteractiveGraph = props => {
  const [activeX, setActiveX] = useState();
  const [activeY, setActiveY] = useState();
  const [isClicked, setIsClicked] = useState();
  const container = useRef();
  const { children } = props;

  useEffect(() => {
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

    const handleTouchMove = e => {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top; // x position within the element.
      setActiveX(x);
      setActiveY(y);
    };

    const handleTouchEnd = () => {
      setActiveX();
      setActiveY();
    };

    const handleTouchStart = () => {
      setIsClicked(true);
      document.addEventListener("touchend", () => {
        setIsClicked(false);
      });
    };

    // Attach event listeners to the knob element in active mode (i.e. not "passive")
    if (container.current) {
      container.current.addEventListener("touchstart", handleTouchStart, {
        passive: false
      });
      container.current.addEventListener("touchmove", handleTouchMove, {
        passive: false
      });
      container.current.addEventListener("touchend", handleTouchEnd, {
        passive: false
      });
      container.current.addEventListener("mousedown", handleMouseDown, {
        passive: false
      });
      container.current.addEventListener("mousemove", handleMouseMove, {
        passive: false
      });
      container.current.addEventListener("mouseleave", handleMouseLeave, {
        passive: false
      });
    }
  });

  return (
    <InteractiveGraphBase ref={container}>
      {children({ activeX, activeY, isClicked })}
    </InteractiveGraphBase>
  );
};
