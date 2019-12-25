import {
  getCoordinatesOfMouseEvent,
  getCoordinatesOfTouchEvent
} from "./domUtils";

export const getInteractivityHandlers = (doRender: any) => {
  let isClicked = false;

  const handleMouseMove = (e: any) => {
    const { x, y } = getCoordinatesOfMouseEvent(e);
    doRender({ canvasElement: e.target, activeX: x, activeY: y, isClicked });
  };

  const handleMouseLeave = (e: any) => {
    doRender({ canvasElement: e.target });
  };

  const handleMouseDown = (e: any) => {
    isClicked = true;

    const { x, y } = getCoordinatesOfMouseEvent(e);
    doRender({ canvasElement: e.target, activeX: x, activeY: y, isClicked });

    document.addEventListener("mouseup", function onMouseUp(e: any) {
      isClicked = false;

      const { x, y } = getCoordinatesOfMouseEvent(e);
      doRender({ canvasElement: e.target, activeX: x, activeY: y, isClicked });

      document.removeEventListener("mouseup", onMouseUp);
    });
  };

  const handleTouchStart = (e: any) => {
    const { x, y } = getCoordinatesOfTouchEvent(e);
    doRender({ canvasElement: e.target, activeX: x, activeY: y, isClicked });
  };

  const handleTouchMove = handleTouchStart;

  const handleTouchEnd = (e: any) => {
    doRender({ canvasElement: e.target });
  };

  return {
    handleMouseDown,
    handleMouseLeave,
    handleMouseMove,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart
  };
};
