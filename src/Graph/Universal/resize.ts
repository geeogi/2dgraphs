let cleanup: () => void;

export const addResizeHandler = (onResize: () => void) => {
  // Cleanup
  if (cleanup) {
    cleanup();
  }
  // Attach event listeners
  window.addEventListener("resize", onResize, { passive: true });

  // Remove event listeners during cleanup
  cleanup = () => {
    window.removeEventListener("resize", onResize);
  };
};
