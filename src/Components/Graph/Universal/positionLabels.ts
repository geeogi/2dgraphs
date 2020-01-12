import { LABEL_MARGIN_X } from "./../../../Components/Graph/constants";

const existingLabelIds: string[] = [];

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
    const node = document.createElement("label");
    node.setAttribute("id", label);
    node.setAttribute(
      "style",
      "position: absolute; pointer-events: none; top: 0; left: 0; font-size: 12px; font-family: Arial;"
    );
    const textNode = document.createTextNode(label);
    node.appendChild(textNode);
    canvasElement.insertAdjacentElement("afterend", node);
    existingLabelIds.push(label);
    return node;
  };

  // Clean up existing labels
  existingLabelIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });

  // Create and position y-axis labels
  priceLabels.forEach((label, index) => {
    const str = "$" + JSON.stringify(label);
    const labelElement = createLabel(str);
    if (labelElement) {
      const yTopPercentage = 1 - (yGridLines[index] + 1) / 2;
      const yTop = yTopPercentage * (resolution[1] - 2 * margin[1]);
      labelElement.style.top = Math.floor(margin[1] + yTop - 18) + "px";
      labelElement.style.left = Math.floor(LABEL_MARGIN_X) + "px";
      labelElement.style.display = "block";
    }
  });

  // Create and position x-axis labels
  dateLabels.forEach(({ label }, index) => {
    const labelElement = createLabel(label);
    if (labelElement) {
      const xLeftPercentage = (xGridLines[index] + 1) / 2;
      const xLeft = xLeftPercentage * (resolution[0] - 2 * margin[0]);
      labelElement.style.left = Math.floor(xLeft - 10) + "px";
      labelElement.style.top = Math.floor(resolution[1] - 19) + "px";
      labelElement.style.display = "block";
    }
  });
};
