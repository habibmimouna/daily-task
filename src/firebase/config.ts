import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBL097xnmZyeOigv7Xi1PtpbTvPFF73J3s",
    authDomain: "daily-task-f1768.firebaseapp.com",
    projectId: "daily-task-f1768",
    storageBucket: "daily-task-f1768.firebasestorage.app",
    messagingSenderId: "488894867936",
    appId: "1:488894867936:web:5448e413bea1d7f1e36385",
    measurementId: "G-J969PEE7VR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);