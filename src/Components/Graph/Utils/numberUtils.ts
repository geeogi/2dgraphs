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
 * * Returns methods which will scale and descale linearly between two value ranges
 * @param {*} minPrimaryValue
 * @param {*} maxPrimaryValue
 * @param {*} minSecondaryValue
 * @param {*} maxSecondaryValue
 */
export const getScaleMethods = (
  minPrimaryValue: number,
  maxPrimaryValue: number,
  minSecondaryValue: number,
  maxSecondaryValue: number
) => {
  const primaryValueRange = maxPrimaryValue - minPrimaryValue;
  const secondaryValueRange = maxSecondaryValue - minSecondaryValue;

  return {
    scale: (primaryValue: number) => {
      const normalPrimaryValue = primaryValue - minPrimaryValue;
      const primaryPercentage = normalPrimaryValue / primaryValueRange;
      return minSecondaryValue + primaryPercentage * secondaryValueRange;
    },
    descale: (secondaryValue: number) => {
      const normalSecondaryValue = secondaryValue - minSecondaryValue;
      const secondaryPercentage = normalSecondaryValue / secondaryValueRange;
      return minPrimaryValue + secondaryPercentage * primaryValueRange;
    }
  };
};
