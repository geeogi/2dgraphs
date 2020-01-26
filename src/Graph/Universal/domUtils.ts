/**
 * Method: Get the coordinates of a mouse event
 * @param {*} e
 */
export const getCoordinatesOfMouseEvent = (e: MouseEvent) => {
  const { target } = (e as any) as { target: HTMLCanvasElement };
  if (!target) {
    throw new Error("No event target found");
  }
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left; // x position within the element.
  const y = e.clientY - rect.top; // x position within the element.
  return { x, y };
};

/**
 * Method: Get the coordinates of a touch event
 * @param {*} e
 */
export const getCoordinatesOfTouchEvent = (e: TouchEvent) => {
  const { target } = (e as any) as { target: HTMLCanvasElement };
  if (!target) {
    throw new Error("No event target found");
  }
  const rect = target.getBoundingClientRect();
  const x = e.changedTouches[0].clientX - rect.left; // x position within the element.
  const y = e.changedTouches[0].clientY - rect.top; // x position within the element.
  return { x, y };
};
