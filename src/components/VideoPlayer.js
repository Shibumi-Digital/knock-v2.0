import React from "react";
import styled from "styled-components";

const Video = styled.video`
  ${"" /* border: 1px solid blue; */}
  width: 400px;
  height: auto;
  border-radius: 10px;
`;

const VideoPlayer = (props) => {
  return <Video {...props} />;
};

export default VideoPlayer;
