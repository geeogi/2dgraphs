import styled from "styled-components";
import { BORDER_COLOR } from "../../Config/colors";
import { MOBILE_SCREEN_WIDTH } from "../../Config/constants";

export const Header = styled.div`
  padding: 16px 32px;
  border-bottom: solid 1px ${BORDER_COLOR};
  margin-bottom: 32px;
  @media (max-width: ${MOBILE_SCREEN_WIDTH}px) {
    padding: 0;
    padding-top: 8px;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
`;