// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpistqkn02kHLsCl9zW_i-yrIAOm3RJuQ",
  authDomain: "neo-mail.firebaseapp.com",
  projectId: "neo-mail",
  storageBucket: "neo-mail.firebasestorage.app",
  messagingSenderId: "411777412645",
  appId: "1:411777412645:web:cfe3dc574ace50e6e3d9cc",
  measurementId: "G-6XYZXSQE1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };