import { createContext } from 'react';
// import UserPool from '../UserPool';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { auth } from '../FirebaseConfig'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import {
  setAuth,
  setUsername,
  setFirstname,
  setLastname,
  setEmail,
  setRole,
  setPermission,
} from '../redux/reducers/auth.reducer';
import {  doc, getDoc } from 'firebase/firestore'; // Import Firestore methods
import { db } from '../FirebaseConfig';

const AccountContext = createContext();

const Account = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  
const getSession = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Unsubscribe from the listener after it has run once
      if (user) {
        console.log(user);
        user.reload() // Reload the user to ensure we have the latest user data
          .then(() => {
            user.getIdToken()
              .then(async (idToken) => {
                try {
                  const userDoc = await getDoc(doc(db, 'users', user.uid)); // Query Firestore for user data
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    resolve({
                      idToken,
                      userData 
                    });
                  } else {
                    console.error("No such document!");
                    reject("No such document!");
                  }
                } catch (error) {
                  console.error("Error getting Firestore document:", error);
                  reject(error);
                }
              })
              .catch((error) => {
                console.error("Error getting ID token:", error);
                reject(error);
              });
          })
          .catch((error) => {
            console.error("Error reloading user:", error);
            reject(error);
          });
      } else {
        reject('No user is signed in');
      }
    });
  });
};

  const authenticate = (email, password) => {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log("User credential:", userCredential);
          const user = userCredential.user;
          resolve(user);
        })
        .catch((error) => {
          console.error("Authentication error:", error);
          reject(error);
        });
    });
  };

  const forgotPassword = (email) => {
    return new Promise((resolve, reject) => {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          console.log('Password reset email sent');
          resolve('Password reset email sent');
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error);
          reject(error);
        });
    });
};

  const logout = () => {
    auth.signOut()
      .then(() => {
        dispatch(setAuth(false));
        dispatch(setUsername(''));
        dispatch(setFirstname(''));
        dispatch(setLastname(''));
        dispatch(setEmail(''));
        dispatch(setRole('demo'));
        dispatch(setPermission(''));
        navigate('/');
        toast.success("Logged out.");
      })
      .catch((error) => {
        console.error("Logout failed", error);
      });
  };

  return (
    <AccountContext.Provider value={{ authenticate, getSession, logout, forgotPassword }}>
      {props.children}
    </AccountContext.Provider>
  );
};

export { Account, AccountContext };