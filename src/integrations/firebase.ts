import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase Configuration - Replace with your actual Firebase config from https://console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5wdHodBNUcUhP64Im_kcsz6H7WlMKVmA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "study-buddy-ai-default.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "study-buddy-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "study-buddy-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "566831257979",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:566831257979:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configure GitHub Provider
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export const updateUserProfile = async (userId: string, name: string, email: string) => {
  try {
    await setDoc(doc(db, "users", userId), {
      name,
      email,
    });
    console.log("User data saved to Firestore");
  } catch (error) {
    console.error("Error saving user data to Firestore: ", error);
  }
};

export const getUserProfile = async (userId: string) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user data from Firestore: ", error);
        return null;
    }
}

export default app;
