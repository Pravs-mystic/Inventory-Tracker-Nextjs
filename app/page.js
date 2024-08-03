'use client'
import styles from "./page.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, onSnapshot, query, doc, deleteDoc, getDoc, updateDoc, where } from "firebase/firestore";
import { db } from './firebase';
import Camera from './camera';

export default function Home() {

  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({ name: '', quantity: '' });

  // add item to database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name === '' || newItem.quantity === '') return;
  
    // Check if the item already exists
    const q = query(collection(db, "items"), where("name", "==", newItem.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert("Item already exists!");
      return;
    }
    const docRef = await addDoc(collection(db, "items"), { name: newItem.name, quantity: parseInt(newItem.quantity) });
    // await updateInventory();
    // setNewItem({ name: '', quantity: '' });
    setItems([...items, { ...newItem, id: docRef.id }]);
    setNewItem({ name: '', quantity: '' });
  };

  //getData
  const updateInventory = async () => {
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id });
      });
      setItems(items);
      return () => {
        unsubscribe();
      }
    });

  }

  // delete item from database
  const deleteItem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      await deleteDoc(doc(db, 'items', id));
      setItems(items.filter(item => item.id !== id));
    }
  };
  

  const addQuantity = async (item) => {
    const docRef = doc(db, 'items', item.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
      setItems(items.map(i => i.id === item.id ? { ...i, quantity: quantity + 1 } : i));
    }
  };

  const removeQuantity = async (item) => {
    const docRef = doc(db, 'items', item.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await updateDoc(docRef, { quantity: quantity - 1 });
        setItems(items.map(i => i.id === item.id ? { ...i, quantity: quantity - 1 } : i));
      } else {
        await deleteDoc(docRef);
        setItems(items.filter(i => i.id !== item.id));
      }
    }
  };

  useEffect(() => {
    console.log('useEffectitems', items);
    updateInventory();
  }, []);

  return (
    <main>
        <div className="container">
          <h1 className="display-4 text-center text-dark p-4 fw-bold bg-light bg-opacity-75 mx-4">Inventory Tracker</h1>
        </div>
        <div className="container d-flex flex-row mt-5 w-80">
          <Camera className="col-12 col-md-6"/>
          
          <div className="bg-dark p-4 rounded-lg container col-12 col-md-6">
            <form className="row g-3 align-items-center" action="">
              <div className="col-12 col-md-4">
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value.toLowerCase() })}
                  className='form-control' type="text" placeholder="Enter Item" />
              </div>
              <div className="col-12 col-md-4">
                <input value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className='form-control' type="number" placeholder="Enter Quantity" />
              </div>
              <div className="col-12 col-md-4">
                <button
                  onClick={addItem}
                  className="btn btn-primary w-100" type="submit">Add to Inventory</button>
              </div>
            </form>

            <ul className="list-group mt-4">
              {items.map((item, id) => (
                <li key={id} className="list-group-item d-flex justify-content-between align-items-center bg-secondary text-white">
                  <div className="d-flex justify-content-between w-50">
                    <span className="text-capitalize">{item.name}</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div>
                    <button
                      onClick={() => addQuantity(item)}
                      className="btn btn-success btn-sm m-2">
                      +
                    </button>
                    <button
                      onClick={() => removeQuantity(item)}
                      className="btn btn-danger btn-sm m-2">
                      -
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="btn btn-warning btn-sm m-2">
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
    </main>
  );
}
