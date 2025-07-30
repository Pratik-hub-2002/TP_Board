// src/components/utils/Image.El.jsx
import { styled } from "@mui/material/styles";

const ImageEl = styled("img")({
  display: "block",
  maxWidth: "150px",
  width: "100%",
  height: "auto",
  margin: "0 auto",
  objectFit: "contain",
});

export default ImageEl;
