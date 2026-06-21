const firebaseConfig = {
  apiKey: "AIzaSyAEOvOCqCbVAV1TUR8c8DchvCYahkQxV6c",
  authDomain: "avatar-vcard-app.firebaseapp.com",
  projectId: "avatar-vcard-app",
  storageBucket: "avatar-vcard-app.firebasestorage.app",
  messagingSenderId: "362969682654",
  appId: "1:362969682654:web:87fbf7cdd7a76bbccf684f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
