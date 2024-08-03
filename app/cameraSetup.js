import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

import {Camera} from "react-camera-pro";

const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Control = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  width: 20%;
  min-width: 100px;
  min-height: 80px;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 50px;
  box-sizing: border-box;
  flex-direction: column-reverse;

  @media (max-aspect-ratio: 1/1) {
    flex-direction: column;
    bottom: 0;
    width: 100%;
    height: 20%;
  }

  @media (max-width: 400px) {
    padding: 10px;
  }
`;

const Button = styled.button`
  outline: none;
  color: white;
  opacity: 1;
  background: transparent;
  background-color: transparent;
  background-position-x: 0%;
  background-position-y: 0%;
  background-repeat: repeat;
  background-image: none;
  padding: 0;
  text-shadow: 0px 0px 4px black;
  background-position: center center;
  background-repeat: no-repeat;
  pointer-events: auto;
  cursor: pointer;
  z-index: 2;
  filter: invert(100%);
  border: none;

  &:hover {
    opacity: 0.7;
  }
`;

const TakePhotoButton = styled(Button)`
  background: url('https://img.icons8.com/ios/50/000000/compact-camera.png');
  background-position: center;
  background-size: 30px;
  background-repeat: no-repeat;
  width: 80px;
  height: 80px;
  border: solid 4px black;
  border-radius: 50%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const TorchButton = styled(Button)`
  background: url('https://img.icons8.com/ios/50/000000/light.png');
  background-position: center;
  background-size: 50px;
  background-repeat: no-repeat;
  width: 80px;
  height: 80px;
  border: solid 4px black;
  border-radius: 50%;

  &.toggled {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const ChangeFacingCameraButton = styled(Button)`
  background: url(https://img.icons8.com/ios/50/000000/switch-camera.png);
  background-position: center;
  background-size: 40px;
  background-repeat: no-repeat;
  width: 40px;
  height: 40px;
  padding: 40px;
  &:disabled {
    opacity: 0;
    cursor: default;
    padding: 60px;
  }
  @media (max-width: 400px) {
    padding: 40px 5px;
    &:disabled {
      padding: 40px 25px;
    }
  }
`;

const ImagePreview = styled.div`
  width: 200px;
  height: 200px;
  ${({ image }) => (image ? `background-image:  url(${image});` : '')}
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  @media (max-width: 400px) {
    width: 50px;
    height: 120px;
  }
`;

// const FullScreenImagePreview = styled.div`
//   width: 30%;
//   height: 30%;
//   z-index: 100;
//   position: absolute;
//   top: 30%;
//   background-color: black;
//   ${({ image }) => (image ? `background-image:  url(${image});` : '')}
//   background-size: contain;
//   background-repeat: no-repeat;
//   background-position: center;
// `;

export default function CameraSetUpComponent(){
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const camera = useRef(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(undefined);
  const [torchToggled, setTorchToggled] = useState(false);

  useEffect(() => {
    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((i) => i.kind == 'videoinput');
      setDevices(videoDevices);
    })();
  });

  return (
    <Wrapper>
      {showImage ? (
        <div className='conatiner w-25'>
        <FullScreenImagePreview
          image={image}
          onClick={() => {
            setShowImage(!showImage);
          }}
        />
        </div>
      ) : (
        <Camera
          ref={camera}
          aspectRatio="cover"
          facingMode="environment"
          numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
          videoSourceDeviceId={activeDeviceId}
          errorMessages={{
            noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
            permissionDenied: 'Permission denied. Please refresh and give camera permission.',
            switchCamera:
              'It is not possible to switch camera to different one because there is only one video device accessible.',
            canvas: 'Canvas is not supported.',
          }}
          videoReadyCallback={() => {
            console.log('Video feed ready.');
          }}
        />
      )}
      <Control>
        <select
          onChange={(event) => {
            setActiveDeviceId(event.target.value);
          }}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
        <ImagePreview
          image={image}
          onClick={() => {
            setShowImage(!showImage);
            }}
            />
            <TakePhotoButton
            onClick={() => {
              if (camera.current) {
              const photo = camera.current.takePhoto();
              setImage(photo);
              setShowImage(!showImage);

              try {
                axios.post('/api/save-photo', { photo }, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }).then(response => {
                  console.log('Photo saved:', response.data);
                }).catch(error => {
                  console.error('Error saving photo:', error);
                });
              } catch (error) {
                console.error('Error saving photo:', error);
              }
              }
            }}
            />
            {camera.current?.torchSupported && (
            <TorchButton
              className={torchToggled ? 'toggled' : ''}
              onClick={() => {
              if (camera.current) {
                setTorchToggled(camera.current.toggleTorch());
              }
            }}
          />
        )}
        <ChangeFacingCameraButton
          disabled={numberOfCameras <= 1}
          onClick={() => {
            if (camera.current) {
              const result = camera.current.switchCamera();
              console.log(result);
            }
          }}
        />
      </Control>
    </Wrapper>
  );
};
