import React from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';


const auth = ({ user, setUser }) => {
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

  return (
    <div className="container">
      {user ? (
        <div>
          <img src={user.photoURL} alt="Profile"/>
          <span>{user.displayName}</span>
          <button onClick={handleSignOut} className="btn btn-primary">Sign Out</button>
        </div>
      ) : (
        <button onClick={signIn} className="btn btn-primary">Sign In with Google</button>
      )}
    </div>
  );
};

export default auth;