export const BORDER_COLOR = "rgb(230,230,230)";
export const BACKGROUND_COLOR = "#fafafa";
export const CONTRAST_COLOR = "#333";

export const PRIMARY_COLOR_WEBGL = [0, 0, 1, 1];

export const PRIMARY_COLOR_2D_CANVAS = "rgb(255, 0, 255)";
export const PRIMARY_COLOR_ALPHA_2D_CANVAS = (opacity: number) =>
  `rgba(255, 0, 255, ${opacity})`;

export const AXIS_COLOR_VEC = [0.95, 0.95, 0.95, 1];
export const AXIS_COLOR_RGB = `
rgb(${Math.round(AXIS_COLOR_VEC[0] * 255)}, 
    ${Math.round(AXIS_COLOR_VEC[1] * 255)}, 
    ${Math.round(AXIS_COLOR_VEC[2] * 255)})
`;

export const ACTIVE_LEGEND_BACKGROUND_VEC = [0, 0, 0, 1];
export const ACTIVE_LEGEND_BACKGROUND_RGB = `
rgb(${Math.round(ACTIVE_LEGEND_BACKGROUND_VEC[0] * 255)}, 
    ${Math.round(ACTIVE_LEGEND_BACKGROUND_VEC[1] * 255)}, 
    ${Math.round(ACTIVE_LEGEND_BACKGROUND_VEC[2] * 255)})
`;

export const ACTIVE_LEGEND_TEXT_VEC = [1, 1, 1, 1];
export const ACTIVE_LEGEND_TEXT_RGB = `
rgb(${Math.round(ACTIVE_LEGEND_TEXT_VEC[0] * 255)}, 
    ${Math.round(ACTIVE_LEGEND_TEXT_VEC[1] * 255)}, 
    ${Math.round(ACTIVE_LEGEND_TEXT_VEC[2] * 255)})
`;

export const ACTIVE_HANDLE_BODY_VEC = [1, 1, 0, 1];
export const ACTIVE_HANDLE_BODY_RGB = `
rgb(${Math.round(ACTIVE_HANDLE_BODY_VEC[0] * 255)}, 
    ${Math.round(ACTIVE_HANDLE_BODY_VEC[1] * 255)}, 
    ${Math.round(ACTIVE_HANDLE_BODY_VEC[2] * 255)})
`;

export const ACTIVE_HANDLE_BORDER_VEC = [0, 0, 0, 1];
export const ACTIVE_HANDLE_BORDER_RGB = `
rgb(${Math.round(ACTIVE_HANDLE_BORDER_VEC[0] * 255)}, 
    ${Math.round(ACTIVE_HANDLE_BORDER_VEC[1] * 255)}, 
    ${Math.round(ACTIVE_HANDLE_BORDER_VEC[2] * 255)})
`;

export const ACTIVE_LINE_VEC = [1, 0, 0, 1];
export const ACTIVE_LINE_RGB = `
rgb(${Math.round(ACTIVE_LINE_VEC[0] * 255)}, 
    ${Math.round(ACTIVE_LINE_VEC[1] * 255)}, 
    ${Math.round(ACTIVE_LINE_VEC[2] * 255)})
`;
