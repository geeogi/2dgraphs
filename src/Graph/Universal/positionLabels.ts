import {
  AXIS_LABEL_CLASS,
  HORIZONTAL_GRID_LINE_CLASS,
  LABEL_MARGIN_X
} from "../../Config/constants";
import { VERTICAL_GRID_LINE_CLASS } from "./../../Config/constants";

// Cache the container element
let container: HTMLElement;

/**
 * Creates and positions label and grid line elements
 * Removes existing label and grid line elements
 * @param canvasElement
 * @param dateLabels
 * @param priceLabels
 * @param xGridLines
 * @param yGridLines
 * @param margin
 */
export const positionLabels = (
  canvasElement: HTMLCanvasElement,
  dateLabels: { unix: number; label: string }[],
  priceLabels: number[],
  xGridLines: number[],
  yGridLines: number[],
  margin: [number, number]
) => {
  const resolution: [number, number] = [
    canvasElement.offsetWidth,
    canvasElement.offsetHeight
  ];

  // Clean up existing label and grid line elements
  if (container) {
    container.remove();
  }

  // Declare arrays for elements
  const xGridLineElements: HTMLElement[] = [];
  const yGridLineElements: HTMLElement[] = [];
  const labelElements: HTMLElement[] = [];

  // Method for creating label element
  const createLabel = (label: string) => {
    const id = label;
    const node = document.createElement("label");
    node.setAttribute("id", id);
    node.className = AXIS_LABEL_CLASS;
    const textNode = document.createTextNode(label);
    node.appendChild(textNode);
    return node;
  };

  // Method for creating Y grid line element
  const createYGridLine = (id: string) => {
    const node = document.createElement("div");
    node.setAttribute("id", id);
    node.className = HORIZONTAL_GRID_LINE_CLASS;
    return node;
  };

  // Method for creating X grid line element
  const createXGridLine = (id: string) => {
    const node = document.createElement("div");
    node.setAttribute("id", id);
    node.className = VERTICAL_GRID_LINE_CLASS;
    return node;
  };

  // Create and position y-axis grid lines and labels
  priceLabels.forEach((label, index) => {
    // Calculate position
    const yTopPercentage = 1 - (yGridLines[index] + 1) / 2;
    const yTop = yTopPercentage * (resolution[1] - 2 * margin[1]);

    // Create and position grid line element
    const gridLine = createYGridLine(`${label}-grid-line`);
    gridLine.style.top = Math.floor(margin[1] + yTop) + "px";

    // Create and position label element
    const str = "$" + JSON.stringify(label);
    const labelElement = createLabel(str);
    labelElement.style.top = Math.floor(margin[1] + yTop - 18) + "px";
    labelElement.style.left = Math.floor(LABEL_MARGIN_X) + "px";

    // Mark elements for insertion
    xGridLineElements.push(gridLine);
    labelElements.push(labelElement);
  });

  // Create and position x-axis grid lines and labels
  dateLabels.forEach(({ label }, index) => {
    // Calculate position
    const xLeftPercentage = (xGridLines[index] + 1) / 2;
    const xLeft = xLeftPercentage * (resolution[0] - 2 * margin[0]);

    // Create and position grid line element
    const gridLine = createXGridLine(`${label}-grid-line`);
    gridLine.style.left = Math.floor(margin[0] + xLeft) + "px";

    // Create and position label element
    const labelElement = createLabel(label);
    labelElement.style.left = Math.floor(xLeft - 10) + "px";
    labelElement.style.top = Math.floor(resolution[1] - 20) + "px";

    // Mark elements for insertion
    yGridLineElements.push(gridLine);
    labelElements.push(labelElement);
  });

  // Create new container, append elements and and insert into DOM
  container = document.createElement("div");
  container.setAttribute("id", "label-and-grid-line-container");
  [...xGridLineElements, ...yGridLineElements, ...labelElements].forEach(
    node => {
      container.appendChild(node);
    }
  );
  canvasElement.insertAdjacentElement("afterend", container);
};
