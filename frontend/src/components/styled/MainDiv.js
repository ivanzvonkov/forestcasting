import backgroundImage from "../../assets/background.jpeg";
import styled from "styled-components";

export const MainDiv = styled.div`
  background-image: url(${backgroundImage});
  position: relative;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  display: block;
  min-height: 100vh;
  width: auto;
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-attachment: fixed;
`;
