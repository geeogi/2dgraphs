import styled from "styled-components";
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  CONTRAST_COLOR,
  PRIMARY_COLOR
} from "../Data/colors";

export const Button = styled.button`
  display: inline-block;
  margin: 4px;
  border-radius: 3px;
  background: ${props => (props.active ? PRIMARY_COLOR : BACKGROUND_COLOR)};
  color: ${props => (props.active ? BORDER_COLOR : CONTRAST_COLOR)};
  border: 2px solid ${props => (props.active ? PRIMARY_COLOR : BORDER_COLOR)};
  cursor: pointer;
`;
