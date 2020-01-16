import dayjs from "dayjs";
import { SPACING_UNIT } from "./constants";
import { clamp } from "./numberUtils";

const ACTIVE_LEGEND_WIDTH = 120;
const ACTIVE_CIRCLE_WIDTH = 10;

export const positionActiveLegend = (
  canvasElement: HTMLCanvasElement,
  activeX: number | undefined,
  margin: [number, number],
  points: { x: number; y: number; dateTime: string; price: number }[]
) => {
  // Fetch resolution
  const resolution: [number, number] = [
    canvasElement.offsetWidth,
    canvasElement.offsetHeight
  ];
  // Calculate graph width and height in px
  const graphWidth = resolution[0] - 2 * margin[0];
  const graphHeight = resolution[1] - 2 * margin[1];

  // Fetch active elements
  const activeLegendElement = document.getElementById("active-legend");
  const activeCircleElement = document.getElementById("active-circle");
  const activeLineElement = document.getElementById("active-line");

  // Show or hide active legend
  if (activeX && activeX > -1) {
    // Scale activeX to [-1,1] clip space
    const clipSpaceX = ((activeX - margin[0]) / graphWidth) * 2 - 1;

    // Fetch nearest point to activeX
    const [{ x, y, dateTime, price }] = [...points].sort(
      (a, b) => Math.abs(a.x - clipSpaceX) - Math.abs(b.x - clipSpaceX)
    );

    // Scale x from [-1,1] clip space to screen resolution
    const nearXGraphX = margin[0] + ((x + 1) / 2) * graphWidth;
    const rawLegendX = nearXGraphX - ACTIVE_LEGEND_WIDTH / 2;
    const legendLeftMax = 0;
    const legendRightMax = resolution[0] - ACTIVE_LEGEND_WIDTH;
    const legendX = clamp(rawLegendX, legendLeftMax, legendRightMax);

    // Scale y from [-1,1] clip space to screen resolution
    const nearYGraphY = margin[1] + ((y + 1) / 2) * graphHeight;
    const baseLegendY = resolution[1] - (margin[1] + 2 * SPACING_UNIT);
    const altLegendY = nearYGraphY - 5 * SPACING_UNIT;
    const useBase = baseLegendY > nearYGraphY;
    const legendY = useBase ? baseLegendY : altLegendY;

    // Format display variables
    const displayPrice = Math.round(price);
    const displayDate = dayjs(dateTime).format("DD MMM YY");

    // Update active legend DOM element
    activeLegendElement.style.left = legendX + "px";
    activeLegendElement.style.top = resolution[1] - legendY + "px";
    activeLegendElement.textContent = `$${displayPrice} – ${displayDate}`;
    activeLegendElement.style.display = "block";

    // Update active circle DOM element
    const d = ACTIVE_CIRCLE_WIDTH / 2;
    activeCircleElement.style.left = nearXGraphX - d + "px";
    activeCircleElement.style.top = resolution[1] - nearYGraphY - d + "px";
    activeCircleElement.style.display = "block";

    // Update active line DOM element
    activeLineElement.style.left = nearXGraphX + "px";
    activeLineElement.style.display = "block";
  } else {
    activeLegendElement.style.display = "none";
    activeCircleElement.style.display = "none";
    activeLineElement.style.display = "none";
  }
};
