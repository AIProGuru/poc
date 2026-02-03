import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
    apiKey: "AIzaSyAgc1FYHNse7kW4QC4jlSt8jTLdoVd5hxw",
    authDomain: "heliorcm-46d2b.firebaseapp.com",
    projectId: "heliorcm-46d2b",
    storageBucket: "heliorcm-46d2b.firebasestorage.app",
    messagingSenderId: "394628458918",
    appId: "1:394628458918:web:9354908d5f20268c51c767",
    measurementId: "G-3BF5S1CZC4"
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
