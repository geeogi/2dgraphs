import {
  AXIS_LABEL_STYLE,
  HORIZONTAL_GRID_LINE_STYLE,
  LABEL_MARGIN_X,
  VERTICAL_GRID_LINE_STYLE
} from "./constants";

const existingElementIds: string[] = [];

// Position axis labels
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

  // Method for creating label in DOM
  const createLabel = (label: string) => {
    const id = label;
    const node = document.createElement("label");
    node.setAttribute("id", id);
    node.setAttribute("style", AXIS_LABEL_STYLE);
    const textNode = document.createTextNode(label);
    node.appendChild(textNode);
    canvasElement.insertAdjacentElement("afterend", node);
    existingElementIds.push(id);
    return node;
  };

  // Method for creating y grid line in DOM
  const createYGridLine = (id: string) => {
    const node = document.createElement("hr");
    node.setAttribute("id", id);
    node.setAttribute("style", HORIZONTAL_GRID_LINE_STYLE);
    canvasElement.insertAdjacentElement("afterend", node);
    existingElementIds.push(id);
    return node;
  };

  // Method for creating x grid line in DOM
  const createXGridLine = (id: string) => {
    const node = document.createElement("div");
    node.setAttribute("id", id);
    node.setAttribute("style", VERTICAL_GRID_LINE_STYLE);
    canvasElement.insertAdjacentElement("afterend", node);
    existingElementIds.push(id);
    return node;
  };

  // Clean up existing elements
  existingElementIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });

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
  });
};
