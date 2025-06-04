// src/config/firebase.ts
import admin from 'firebase-admin';
import serviceAccount from '../../closetiq-c0b88-firebase-adminsdk-p8rac-f930ee80e7.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export default admin;
