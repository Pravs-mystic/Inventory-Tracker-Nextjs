import React, { useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Camera } from "react-camera-pro";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 4/3;
`;

const Control = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TakePhotoButton = styled.button`
  width: 60px;
  height: 60px;
  border: solid 4px white;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

export default function CameraSetUpComponent({ onCapture }) {
  const camera = useRef(null);

  const handleCapture = async () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      onCapture(photo);

      try {
        await axios.post('/api/save-photo', { photo }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Photo saved successfully');
      } catch (error) {
        console.error('Error saving photo:', error);
      }
    }
  };

  return (
    <Wrapper>
      <Camera
        ref={camera}
        aspectRatio="cover"
        facingMode="environment"
      />
      <Control>
        <TakePhotoButton onClick={handleCapture} />
      </Control>
    </Wrapper>
  );
}