const roundUpToNearest = (value, multiple) => {
  return Math.ceil(value / multiple) * multiple;
};

const roundDownToNearest = (value, multiple) => {
  return Math.floor(value / multiple) * multiple;
};

export const valueLabels = (minValue, maxValue, numberOfLabels = 5) => {
  const perfectStep = (maxValue - minValue) / numberOfLabels;
  const multiple = [100, 250, 500, 1000].sort((a, b) => {
    return Math.abs(a - perfectStep) - Math.abs(b - perfectStep);
  })[0];
  const firstLabel = roundDownToNearest(minValue, multiple);
  const labelRange = maxValue - firstLabel;
  const labelStep = roundUpToNearest(
    labelRange / (numberOfLabels - 1),
    multiple
  );
  return [...Array(numberOfLabels)].map((_, index) => {
    if (index === 0) {
      return firstLabel;
    } else {
      return firstLabel + labelStep * index;
    }
  });
};
