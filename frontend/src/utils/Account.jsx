import { createContext } from 'react';
// import UserPool from '../UserPool';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { auth } from '../FirebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { SERVER_URL } from './config';
import {
  setAuth,
  setUsername,
  setFirstname,
  setLastname,
  setEmail,
  setRole,
  setPermission,
  setTenant,
  setAppType,
  setModules,
  setDenialCategory,
  setPayer,
  setValue,
  setFacility,
} from '../redux/reducers/auth.reducer';
import {  doc, getDoc } from 'firebase/firestore/lite'; // Import Firestore methods
import { db } from '../FirebaseConfig';

const AccountContext = createContext();

const Account = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clearAuthState = () => {
    dispatch(setAuth(false));
    dispatch(setUsername(''));
    dispatch(setFirstname(''));
    dispatch(setLastname(''));
    dispatch(setEmail(''));
    dispatch(setRole(''));
    dispatch(setPermission(''));
    dispatch(setTenant(''));
    dispatch(setAppType(null));
    dispatch(setModules([]));
    dispatch(setDenialCategory([]));
    dispatch(setPayer([]));
    dispatch(setValue([]));
    dispatch(setFacility([]));
  };

  
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
        resolve(null);
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

  const forgotPassword = async (email) => {
    const normalizedEmail = `${email || ''}`.trim().toLowerCase();
    const response = await fetch(`${SERVER_URL}/api/v1/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to send password reset email.');
    }
    return data?.message || 'Password reset email sent';
  };

  const logout = () => {
    auth.signOut()
      .then(() => {
        clearAuthState();
        try {
          localStorage.removeItem('lastAppType');
        } catch (err) {
          // Ignore storage errors.
        }
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
