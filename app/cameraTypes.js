//<reference types="react" />

const FacingMode = ['user', 'environment'];
const AspectRatio = ['cover'];
const CameraProps = {
    facingMode: FacingMode,
    aspectRatio: AspectRatio,
    numberOfCamerasCallback: (numberOfCameras) => {},
    videoSourceDeviceId: undefined,
    errorMessages: {
        noCameraAccessible: '',
        permissionDenied: '',
        switchCamera: '',
        canvas: ''
    },
    videoReadyCallback: () => {}
};

// Define the CameraType structure
const CameraType = {
    ...React.forwardRef((props, ref) => {
        // Implement the Camera component logic here
    }),
    takePhoto: () => {
        // Implement the takePhoto function
    },
    switchCamera: () => {
        // Implement the switchCamera function
    },
    getNumberOfCameras: () => {
        // Implement the getNumberOfCameras function
    }
};

// Export the constants and objects
export {
    FacingMode,
    AspectRatio,
    CameraProps,
    CameraType
};
