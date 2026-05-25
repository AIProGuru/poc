import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
    apiKey: "AIzaSyBNAzDL2b5g0TaXTZVocilayMP59sbufR4",
    authDomain: "heliorcm-e8d7a.firebaseapp.com",
    projectId: "heliorcm-e8d7a",
    storageBucket: "heliorcm-e8d7a.firebasestorage.app",
    messagingSenderId: "763930456497",
    appId: "1:763930456497:web:18d1ad65ff112aa35b8d90",
    measurementId: "G-Z4G00NTT0M"
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
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const logPayload = {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    apiKeyDefined: Boolean(firebaseConfig.apiKey),
};

const logConfig = () => {
    console.log('[FirebaseConfig] Using project configuration:', logPayload);
};

if (typeof window !== 'undefined') {
    if (!window.__FIREBASE_CONFIG_LOGGED__) {
        logConfig();
        window.__FIREBASE_CONFIG_LOGGED__ = true;
    }
} else {
    logConfig();
}

// Initialize Authentication
const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
