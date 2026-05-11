// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMavfylJn_RlHxBs1WOfhWa7MYypg4OTc",
  authDomain: "carbon-d1f5e.firebaseapp.com",
  projectId: "carbon-d1f5e",
  storageBucket: "carbon-d1f5e.firebasestorage.app",
  messagingSenderId: "241152337603",
  appId: "1:241152337603:web:44bdb58ea8d165f8962476",
  measurementId: "G-D8DCW1BD1J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
