import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyBjoQxbcSwkhKR2AJqfL6L0SGWRWniOWe4",

  authDomain: "cs490-exercise-app.firebaseapp.com",

  projectId: "cs490-exercise-app",

  storageBucket: "cs490-exercise-app.firebasestorage.app",

  messagingSenderId: "77761083080",

  appId: "1:77761083080:web:278e2654b3b0e1f1e2d7fd"

};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export default app;
  