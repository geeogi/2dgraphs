/**
 * Returns the input value if its between min & max,
 * otherwise returns either min or max depending on which is closest
 * @param {*} value
 * @param {*} min
 * @param {*} max
 */
export const clamp = (value: number, min: number, max: number) => {
  return value < min ? min : value > max ? max : value;
};

/**
 * * Returns method which will scale linearly between two value ranges
 * @param {*} minPrimaryValue
 * @param {*} maxPrimaryValue
 * @param {*} minSecondaryValue
 * @param {*} maxSecondaryValue
 */
export const getScaleMethod = (
  minPrimaryValue: number,
  maxPrimaryValue: number,
  minSecondaryValue: number,
  maxSecondaryValue: number
) => {
  const primaryValueRange = maxPrimaryValue - minPrimaryValue;
  const secondaryValueRange = maxSecondaryValue - minSecondaryValue;

  return (primaryValue: number) => {
    const normalizedPrimaryValue = primaryValue - minPrimaryValue;
    const primaryPercentage = normalizedPrimaryValue / primaryValueRange;
    return minSecondaryValue + primaryPercentage * secondaryValueRange;
  };
};
