/* eslint-disable react/prop-types */
import React, { createContext, useEffect, useState } from 'react'
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import app from "../firebase/firebase.config"
import axios from "axios";

export const AuthContext = createContext();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // create an account
  const createUsers = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // signup with gmail
  const signUpWithGmail = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider)
  }

  // login using email & password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // logout 
  const logOut = () => {
    return signOut(auth);
  }

  // update profile
  const updateUserProfile = (name, photoURL) => {
    return updateProfile(auth.currentUser, {
      displayName: name, photoURL: photoURL
    })
  }

  // check signed-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      // console.log(currentUser);
      setUser(currentUser);
      if (currentUser) {
        const userInfo = { email: currentUser.email }
        axios.post('https://foodi-mern-server.onrender.com/jwt', 
          userInfo
        ).then(
          (res) => {
            if(res.data.token){
              localStorage.setItem('access-token', res.data.token)
            }
          }
        )
      } else {
        localStorage.removeItem("access-token")
      }

      setLoading(false);
    });

    return () => {
      return unsubscribe();
    }
  }, [])

  const authInfo = {
    user,
    createUsers,
    signUpWithGmail,
    login,
    logOut,
    updateUserProfile,
    loading
  }
  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider