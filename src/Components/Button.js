import styled from "styled-components";
import { BACKGROUND_COLOR, BORDER_COLOR, CONTRAST_COLOR } from "../Config/colors";

export const Button = styled.button`
  display: inline-block;
  margin: 2px;
  border-radius: 3px;
  padding: 2px 8px;
  background: ${props => (props.active ? BORDER_COLOR : BACKGROUND_COLOR)};
  color: ${CONTRAST_COLOR};
  border: 2px solid ${BORDER_COLOR};
  cursor: pointer;
  :hover {
    background: ${BORDER_COLOR};
  }
`;
