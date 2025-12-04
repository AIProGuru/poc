import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
        apiKey: "AIzaSyAImJlQvtdEmX2eIksZwBAy9vWddNmOywo",
        authDomain: "gabeo-poc.firebaseapp.com",
        projectId: "gabeo-poc",
        storageBucket: "gabeo-poc.appspot.com",
        messagingSenderId: "942335066163",
        appId: "1:942335066163:web:1eb7146c2017acf65ca346"
    };

// const firebaseConfig = {
//     apiKey: "AIzaSyDijNOhO7agUS6aDOPkb_Dkzfmn1z3XNxE",
//     authDomain: "gabeo-staging.firebaseapp.com",
//     projectId: "gabeo-staging",
//     storageBucket: "gabeo-staging.firebasestorage.app",
//     messagingSenderId: "630739682821",
//     appId: "1:630739682821:web:b2f6a0fca13f1b9a027e6c"
//   };
    
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };