import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// PASTE YOUR ACTUAL KEYS FROM FIREBASE CONSOLE HERE:
const firebaseConfig = {
  apiKey: "AIzaSyBrswxsVsKgvT5DpaJ5u8I3J3Oe0HTl-g0",
  authDomain: "mygamelibrary-189c5.firebaseapp.com",
  projectId: "mygamelibrary-189c5",
  storageBucket: "mygamelibrary-189c5.firebasestorage.app",
  messagingSenderId: "879973895053",
  appId: "1:879973895053:web:40d2367d41f556e5b18bc4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// This forces the Google account picker to show every time
provider.setCustomParameters({ prompt: 'select_account' });