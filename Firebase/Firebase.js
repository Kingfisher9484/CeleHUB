import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCNkUxwA80AUxzFGHWZVsq3NsP0GxYCiQ",
  authDomain: "celehub-5ebb0.firebaseapp.com",
  projectId: "celehub-5ebb0",
  storageBucket: "celehub-5ebb0.appspot.com", // Corrected storage bucket
  messagingSenderId: "73071123798",
  appId: "1:73071123798:web:ed01badead6d107425caf7",
  measurementId: "G-4JWVGWVJYH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export {auth,db} ;



/*import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in", user);
  } else {
    console.log("User is logged out");
  }
});
*/