import React, { useState } from 'react';
import CameraSetUpComponent from "./cameraSetup"
import { Modal, Button, Form } from 'react-bootstrap';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true 
  });

export default function Camera({ addItemToInventory }) {
    const [camera, setCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isClassifying, setIsClassifying] = useState(false);

    const handleCapture = (image) => {
        setCapturedImage(image);
        setCamera(false);
        classifyImage(image);
    };

    const classifyImage = async (image) => {
        setIsClassifying(true);
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "What item is shown in this image? Provide a brief, one or two word description." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: image,
                                },
                            },
                        ],
                    },
                ],
            });
            setItemName(response.choices[0].message.content.replace(/\.$/, ''));
        } catch (error) {
            console.error("Error classifying image:", error);
            setItemName("Unknown Item");
        } finally {
            setIsClassifying(false);
        }
    };

    const handleAddToInventory = () => {
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        addItemToInventory({ name: itemName, quantity: parseInt(quantity) });
        setShowModal(false);
        setCapturedImage(null);
        setItemName('');
        setQuantity('');
    };

    return (
        <div className="flex-container d-flex flex-column align-items-center">
            <h4 className='shadow p-4 mx-2 bg-light bg-gradient'>Do you want to add an item through Camera?</h4>
            <button className="w-25 btn btn-outline-primary mt-4" onClick={() => setCamera(true)}>
                Take a picture
            </button>
            {camera && (
                <CameraSetUpComponent onCapture={handleCapture} />
            )}
            {capturedImage && (
                <div className="mt-4 d-flex flex-column align-items-center">
                    <img src={capturedImage} alt="Captured item" className="img-fluid" style={{ maxWidth: '300px' }} />
                    <h4 className="mt-3 p-4 mx-2 bg-light shadow-sm">Item Name: {itemName}</h4>
                    <button className="btn mt-3 bg-primary bg-gradient text-white" onClick={handleAddToInventory}>
                        Update the item to Inventory
                    </button>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Item to Inventory</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Item Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={itemName} 
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleModalSubmit}>
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}