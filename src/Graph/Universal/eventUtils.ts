import {
  getCoordinatesOfMouseEvent,
  getCoordinatesOfTouchEvent
} from "./domUtils";

let cleanup: () => void;

/**
 * Return event listeners which will call the callback method with activeX,
 * activeY and isClicked whenever these values change
 * @param callback
 */
export const addInteractivityHandlers = (
  callback: (args: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => void,
  element: HTMLElement
) => {
  // Cleanup existing listeners
  if (cleanup) {
    cleanup();
  }

  // Clicked state
  let isClicked = false;

  // Methods
  const handleMouseMove = (e: any) => {
    const { x, y } = getCoordinatesOfMouseEvent(e);
    callback({
      activeX: x,
      activeY: y,
      isClicked
    });
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

  // Attach event listeners
  element.addEventListener("mousedown", handleMouseDown, { passive: true });
  element.addEventListener("mousemove", handleMouseMove, { passive: true });
  element.addEventListener("touchmove", handleTouchMove, { passive: true });
  element.addEventListener("touchstart", handleTouchStart, { passive: true });

  // Remove event listeners during cleanup
  cleanup = () => {
    element.removeEventListener("mousedown", handleMouseDown);
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchstart", handleTouchStart);
  };
};
