import { initializeApp } from 'firebase/app';
import {  getFirestore } from 'firebase/firestore';
import { getAuth,createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCg8MhAvahbKd2HtA1DKw4LdCqKfMyFAzc",
    authDomain: "cardi8.firebaseapp.com",
    projectId: "cardi8",
    storageBucket: "cardi8.appspot.com",
    messagingSenderId: "790889170605",
    appId: "1:790889170605:web:77b4c5d7d2be97d1b3e824"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
export const auth = getAuth(app);

export const createUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };