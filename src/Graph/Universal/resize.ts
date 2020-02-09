/**
 * Util for attaching resize listener to the Window
 * Will cleanup existing resize listener
 * @param onResize
 */
let cleanup: () => void;
export const addResizeHandler = (onResize: () => void) => {
  // Cleanup
  if (cleanup) {
    cleanup();
  }
  // Attach event listener
  window.addEventListener("resize", onResize, { passive: true });

  // Remove event listener during cleanup
  cleanup = () => {
    window.removeEventListener("resize", onResize);
  };
};
