import {
  getCoordinatesOfMouseEvent,
  getCoordinatesOfTouchEvent
} from "../../2DCanvas/2DCanvasUtils/domUtils";

/**
 * Return event listeners which will call the render method with activeX,
 * activeY and isClicked whenever any of these values change
 * @param callback
 */
export const getWebGLInteractivityHandlers = (
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
