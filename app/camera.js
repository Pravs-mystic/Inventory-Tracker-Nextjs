import CameraSetUpComponent from "./cameraSetup"
import React, { useState } from 'react';

export default function Camera() {

    const [camera, setCamera] = useState(false);

    return (
        <div className="flex-container d-flex flex-column align-items-center">
            <h4>Do you want to add an item through Camera?</h4>
            <button className="w-25 btn btn-outline-primary mt-4" onClick={() => setCamera(true)}>
                Take a picture
            </button>
            <div>
            {camera && <CameraSetUpComponent />}
            </div>
        </div>
    )

}