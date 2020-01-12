import styled from "styled-components";
import { MOBILE_SCREEN_WIDTH } from "../../Config/constants";

export const Canvas = styled.canvas`
  user-select: none;
  touch-action: none;
  display: block;
  width: 100%;
  height: 400px;
  @media (max-width: ${MOBILE_SCREEN_WIDTH}px) {
    height: 300px;
  }
`;
