import { initializeApp } from "firebase/app";
import { collection, getDoc, getFirestore, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJyb8WBWqMEW6wsgfqd8ici0e8X3mMnB4",
  authDomain: "fire-example-todo.firebaseapp.com",
  projectId: "fire-example-todo",
  storageBucket: "fire-example-todo.appspot.com",
  messagingSenderId: "117690765139",
  appId: "1:117690765139:web:07c2c7c9d406b011339ba6",
};

const myApp = initializeApp(firebaseConfig);
export const db = getFirestore();
export const gameRef = collection(db, "games");
export const gameDocRef = doc(db, "games/example-game-id");

export default myApp;
