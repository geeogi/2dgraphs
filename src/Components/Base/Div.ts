import styled from "styled-components";

interface Div {
  position: string;
}

export const Div = styled.div<Div>`
  position: ${props => props.position};
`;
