import dayjs from "dayjs";
import {
  ACTIVE_CIRCLE_WIDTH,
  ACTIVE_LEGEND_WIDTH,
  SPACING_UNIT
} from "../../Config/constants";
import {
  ACTIVE_CIRCLE,
  ACTIVE_LEGEND,
  ACTIVE_LINE
} from "./../../Config/constants";
import { GraphPoints } from "./../../types";
import { clamp } from "./numberUtils";

/**
 * Position the active legend, circle and line to match the active x-coordinate
 * @param canvasElement
 * @param activeX
 * @param margin
 * @param points
 */
export const positionActiveLegend = (
  canvasElement: HTMLCanvasElement,
  activeX: number | undefined,
  margin: [number, number],
  points: GraphPoints
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
  const activeLegendElement = document.getElementById(ACTIVE_LEGEND);
  const activeCircleElement = document.getElementById(ACTIVE_CIRCLE);
  const activeLineElement = document.getElementById(ACTIVE_LINE);

  // Show or hide active legend
  if (activeX && activeX > -1) {
    // Scale activeX to [-1,1]
    const scaledActiveX = ((activeX - margin[0]) / graphWidth) * 2 - 1;

    // Fetch nearest point to activeX
    const [{ x, y, dateTime, price }] = [...points].sort(
      (a, b) => Math.abs(a.x - scaledActiveX) - Math.abs(b.x - scaledActiveX)
    );

    // Calculate x for legend in px
    const nearXGraphX = margin[0] + ((x + 1) / 2) * graphWidth;
    const rawLegendX = nearXGraphX - ACTIVE_LEGEND_WIDTH / 2;
    const legendLeftMax = 0;
    const legendRightMax = resolution[0] - ACTIVE_LEGEND_WIDTH;
    const legendX = clamp(rawLegendX, legendLeftMax, legendRightMax);

    // Calculate y for legend in px
    const nearYGraphY = margin[1] + ((y + 1) / 2) * graphHeight;
    const legendMargin = margin[1] + 2 * SPACING_UNIT;
    const baseLegendY = resolution[1] - legendMargin;
    const altLegendY = legendMargin;
    const useBase = baseLegendY > nearYGraphY + 5 * SPACING_UNIT;
    const legendY = useBase ? baseLegendY : altLegendY;

    // Format display variables
    const displayPrice = Math.round(price);
    const displayDate = dayjs.unix(dateTime).format("DD MMM YY");

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
