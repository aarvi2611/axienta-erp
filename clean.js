const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBDzPuLRL37CHiGPgqDBW81kL20Dxj6HPo",
  authDomain: "axientaerp.firebaseapp.com",
  projectId: "axientaerp",
  storageBucket: "axientaerp.firebasestorage.app",
  messagingSenderId: "966819059268",
  appId: "1:966819059268:web:a310b5aea9d57668940e11"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clean() {
  const q = query(collection(db, "leads"), where("name", "==", "Unknown Lead"));
  const snap = await getDocs(q);
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "leads", d.id));
    count++;
  }
  
  // also clean empty names just in case
  const q2 = query(collection(db, "leads"), where("name", "==", ""));
  const snap2 = await getDocs(q2);
  for (const d of snap2.docs) {
    await deleteDoc(doc(db, "leads", d.id));
    count++;
  }

  console.log('Cleaned up ' + count + ' corrupted leads');
}
clean();
