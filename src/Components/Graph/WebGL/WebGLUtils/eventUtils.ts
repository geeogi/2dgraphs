import {
  getCoordinatesOfMouseEvent,
  getCoordinatesOfTouchEvent
} from "../../2DCanvas/2DCanvasUtils/domUtils";

/**
 * Return event listeners which will call the render method with activeX,
 * activeY and isClicked whenever any of these values change
 * @param renderMethod
 */
export const getWebGLInteractivityHandlers = (
  renderMethod: (args?: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => void
) => {
  let isClicked = false;

  const handleMouseMove = (e: any) => {
    const { x, y } = getCoordinatesOfMouseEvent(e);
    renderMethod({
      activeX: x,
      activeY: y,
      isClicked
    });
  };

  const handleMouseLeave = (e: any) => {
    renderMethod();
  };

  const handleMouseDown = (e: any) => {
    isClicked = true;

    const { x, y } = getCoordinatesOfMouseEvent(e);
    renderMethod({
      activeX: x,
      activeY: y,
      isClicked
    });

    document.addEventListener("mouseup", function onMouseUp(e: any) {
      isClicked = false;

      const { x, y } = getCoordinatesOfMouseEvent(e);
      renderMethod({
        activeX: x,
        activeY: y,
        isClicked
      });

      document.removeEventListener("mouseup", onMouseUp);
    });
  };

  const handleTouchStart = (e: any) => {
    const { x, y } = getCoordinatesOfTouchEvent(e);
    renderMethod({
      activeX: x,
      activeY: y,
      isClicked
    });
  };

  const handleTouchMove = handleTouchStart;

  const handleTouchEnd = (e: any) => {
    renderMethod();
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
