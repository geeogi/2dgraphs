import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  padding: ${props => props.padding};
  text-align: ${props => (props.textAlignCenter ? "center" : "none")};
`;
