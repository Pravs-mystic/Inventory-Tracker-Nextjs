'use client'
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, onSnapshot, query, doc, deleteDoc, getDoc, updateDoc, where } from "firebase/firestore";
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import Camera from './camera';
import Image from 'next/image';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        updateInventory(user);
       
      } else {
        setItems([]);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  // add item to database
  const addItem = async (item) => {
    if (item.name === '' || item.quantity === '') return;
  
    const q = query(collection(db, "items"), where("name", "==", item.name), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert("Item already exists!");
      return;
    }
    const docRef = await addDoc(collection(db, "items"), { 
      name: item.name, 
      quantity: parseInt(item.quantity),
      userId: user.uid 
    });
    setItems([...items, { ...item, id: docRef.id }]);
  };

  //getData
  const updateInventory = async (tUser) => {
    if (!tUser) {
      return
    }; 
    console.log('tUser UI', tUser);
    const q = query(collection(db, "items"), where("userId", "==", tUser.uid)); 
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

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container-fluid bg-light">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10">
        <div 
            style={{ 
              position: 'relative',
              backgroundImage: "url(/images/bgrobot.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "200px",
              borderBottom: '1px solid #dee2e6'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            ></div>
            <h1 className="display-4 text-center text-white p-4 fw-bold my-4"
            style={{ 
              position: 'relative', 
              zIndex: 1,
              textShadow: '2px 2px 4px rgba(255,255,255,0.5)'
            }}>
              Inventory Tracker
            </h1>
          </div>
          {user ? (
            <div className="my-4 text-center">
              <img src={user.photoURL} alt="Profile" className="rounded-circle me-2" style={{width: '40px', height: '40px'}} />
              <span className="me-2">{user.displayName}</span>
              <button onClick={handleSignOut} className="btn btn-outline-secondary">Sign Out</button>
            </div>
          ) : (
            <div className="my-5 text-center">
              <button onClick={signIn} className="btn btn-outline-primary">Sign In with Google</button>
              <div className= "m-auto p-5 mt-5 bg-white rounded shadow-sm">
              <p>Track your items in your inventory with this user friendly app. Click a picture of the item with your camera and see the magic happen! You are just two clicks away from updating your Inventory.</p>
              </div>
            </div>
          )}

          {user && (
            <>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mb-4 shadow-sm"
              />

              <div className="row">
                <div className="col-12 col-md-6 p-3 bg-white rounded shadow-sm">
                  <Camera addItemToInventory={addItem} />
                </div>
                
                <div className="col-12 col-md-6 p-3 bg-white rounded shadow-sm">
                  <div className="p-4 rounded-lg">
                    <form className="row g-3" onSubmit={(e) => { e.preventDefault(); addItem(newItem); setNewItem({name:'', quantity:''}) }}>
                      <div className="col-12 col-sm-4">
                        <input
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value.toLowerCase() })}
                          className='form-control' type="text" placeholder="Enter Item"
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-4">
                        <input
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                          className='form-control' type="number" placeholder="Enter Quantity"
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-4">
                        <button className="btn w-100 bg-primary bg-gradient text-white" type="submit">Add to Inventory</button>
                      </div>
                    </form>

                    <ul className="list-group mt-4">
                      {filteredItems.map((item, id) => (
                        <li key={id} className="list-group-item d-flex justify-content-between align-items-center bg-light bg-gradient text-dark shadow-sm mb-2">
                          <div className="d-flex justify-content-between flex-grow-1 me-2">
                            <span className="text-capitalize">{item.name}</span>
                            <span>{item.quantity}</span>
                          </div>
                          <div>
                            <button
                              onClick={() => addQuantity(item)}
                              className="btn btn-sm m-1 btn-outline-success">
                              +
                            </button>
                            <button
                              onClick={() => removeQuantity(item)}
                              className="btn btn-sm m-1 btn-outline-danger">
                              -
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="btn btn-sm m-1 btn-outline-secondary">
                              X
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}