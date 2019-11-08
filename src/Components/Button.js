import styled from "styled-components";
import { PRIMARY_COLOR, BACKGROUND_COLOR, BORDER_COLOR } from "../Data/colors";

export const Button = styled.button`
  display: inline-block;
  border-radius: 3px;
  background: ${props => (props.active ? PRIMARY_COLOR : BACKGROUND_COLOR)};
  color: white;
  border: 2px solid ${props => (props.active ? PRIMARY_COLOR : BORDER_COLOR)};
  cursor: pointer;
`;
