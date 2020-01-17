import {
  getCoordinatesOfMouseEvent,
  getCoordinatesOfTouchEvent
} from "./domUtils";

/**
 * Return event listeners which will call the callback method with activeX,
 * activeY and isClicked whenever these values change
 * @param callback
 */
export const getInteractivityHandlers = (
  callback: (args: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => void
) => {
  let isClicked = false;

  const handleMouseMove = (e: any) => {
    const { x, y } = getCoordinatesOfMouseEvent(e);
    callback({
      activeX: x,
      activeY: y,
      isClicked
    });
  };

  const handleMouseLeave = (e: any) => {
    callback({});
  };

  const handleMouseDown = (e: any) => {
    isClicked = true;

    const { x, y } = getCoordinatesOfMouseEvent(e);
    callback({
      activeX: x,
      activeY: y,
      isClicked
    });

    document.addEventListener("mouseup", function onMouseUp(e: any) {
      isClicked = false;

      const { x, y } = getCoordinatesOfMouseEvent(e);
      callback({
        activeX: x,
        activeY: y,
        isClicked
      });

      document.removeEventListener("mouseup", onMouseUp);
    });
  };

  const handleTouchStart = (e: any) => {
    const { x, y } = getCoordinatesOfTouchEvent(e);
    callback({
      activeX: x,
      activeY: y,
      isClicked
    });
  };

  const handleTouchMove = handleTouchStart;

  const handleTouchEnd = (e: any) => {
    callback({});
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
