import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  "projectId": "studio-7032562866-2698c",
  "appId": "1:1007658106196:web:8479aba3f2c47560605cc1",
  "apiKey": "AIzaSyCV8vRCboshcurNS3N1Lnoc785gXGdbK4k",
  "authDomain": "studio-7032562866-2698c.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1007658106196"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
