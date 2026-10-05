const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "firebase/firestore";',
  'import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch, setDoc } from "firebase/firestore";'
);

fs.writeFileSync(file, content, 'utf8');
