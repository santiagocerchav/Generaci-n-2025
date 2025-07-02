import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { 
  getStorage, 
  ref as storageRef,
  uploadBytes, 
  getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { 
  getDatabase,
  ref as databaseRef,
  onValue,
  set
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBQpHrqERod-iq_t4lDQtJtEKEQ8JXvvQo",
  authDomain: "gen25-2-prueba1.firebaseapp.com",
  databaseURL: "https://gen25-2-prueba1-default-rtdb.firebaseio.com",
  projectId: "gen25-2-prueba1",
  storageBucket: "gen25-2-prueba1.firebasestorage.app",
  messagingSenderId: "365588361777",
  appId: "1:365588361777:web:1afec145b43110dea11b10",
  measurementId: "G-GXZ6CP23D3"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { 
  storage,
  storageRef,
  uploadBytes, 
  getDownloadURL,
  db, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  realtimeDb,
  databaseRef,
  onValue,
  set
};