import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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