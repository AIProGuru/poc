import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../FirebaseConfig"; // Ensure you have configured Firestore in FirebaseConfig

import { AccountContext } from "../utils/Account";
import {
  setAuth,
  setUsername,
  setRole,
  setFirstname,
  setLastname,
  setPermission,
} from "../redux/reducers/auth.reducer";
import { increasePart1Loading, setCode, setKeyword, setPart1Loading, setPart2Loading, setPOS, setProcedure, setRemark, setTableData, setTableLoading } from "../redux/reducers/app.reducer";

export default function SignIn() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { authenticate } = useContext(AccountContext);


  const signIn = async () => {
    setLoading(true);
    try {
      const data = await authenticate(user, password);
      console.log(data.uid)
      const userDoc = await getDoc(doc(db, "users", data.uid));
  
      if (userDoc.exists()) {
        if (userDoc.data().status > 0){
          toast.error("Please contact the administrator.");
          setLoading(false)
        }
        else{
        dispatch(setAuth(true));
        dispatch(setFirstname(userDoc.data().firstname));
        dispatch(setLastname(userDoc.data().lastname));
        dispatch(setRole(userDoc.data().role));
        dispatch(setPermission(""));
        dispatch(setUsername(userDoc.data().firstname ?? ""));
        navigate("/medevolve");
        toast.success("Login Successful!");
        }
      } else {
        toast.error("User document does not exist.");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      dispatch(setAuth(false));
      dispatch(setUsername(""));
      dispatch(setRole(0));
      toast.error("Login failure!");
      setLoading(false);
    }
  };

  // const signIn = async () => {
  //   setLoading(true);
  //       // authenticate(user, password)
  //   //   .then((data) => {
  //   //     dispatch(setAuth(true));
  //   //     dispatch(setUsername(data.accessToken.payload.username));
  //   //     dispatch(setFirstname(data.idToken.payload.given_name));
  //   //     dispatch(setLastname(data.idToken.payload.family_name));
  //   //     dispatch(setRole(data.idToken.payload['custom:role']))
  //   //     dispatch(setPermission(data.idToken.payload['custom:permission']))
  //   //     toast.success("Successful login!")
  //   //     navigate("/");
  //   //     setLoading(false)
  //   //   })
  //   //   .catch((err) => {
  //   //     console.log(err);
  //   //     dispatch(setAuth(false));
  //   //     dispatch(setUsername(''));
  //   //     dispatch(setRole(0));
  //   //     toast.error("Login failure!")
  //   //     setLoading(false)
  //   //   })
  //   try {
  //     const data = await authenticate(user, password);
  //     const userDoc = await getDoc(doc(db, "users", data.uid));

  //     if (userDoc.exists() && userDoc.data().is_approved_by_admin) {
  //       console.log(userDoc.data())
  //       dispatch(setAuth(true));
  //       dispatch(setFirstname(userDoc.data().firstName));
  //       dispatch(setLastname(userDoc.data().lastName));
  //       dispatch(setRole(userDoc.data().access_level));
  //       dispatch(setPermission(""));
  //       dispatch(setUsername(data.displayName ?? ""));
  //       dispatch(setRole(2));
  //       toast.success("Login Successful!");
  //       navigate("/");
  //     } else {
  //       toast.error("Your account is not approved by admin.");
  //       setLoading(false);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     dispatch(setAuth(false));
  //     dispatch(setUsername(""));
  //     dispatch(setRole(0));
  //     if (err.message === "Email not verified") {
  //       toast.error("Email not verified. Please verify your email");
  //     } else {
  //       toast.error("Login failure!");
  //     }
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="h-screen w-full overflow-x-hidden">
      <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Login
          </h2>
        </div>
        <form
          method="POST"
          className="mx-auto mt-16 max-w-xl sm:mt-20"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="username"
                className="block text-sm font-semibold leading-6 text-gray-900"
              >
                Username
              </label>
              <div className="mt-2.5">
                <input
                  type="text"
                  name="username"
                  value={user}
                  onKeyDown={(e) => e.keyCode === 13 && signIn()}
                  onChange={(e) => setUser(e.target.value)}
                  id="username"
                  autoComplete="username"
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-scienceblue sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2.5">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onKeyDown={(e) => e.keyCode === 13 && signIn()}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-scienceblue sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-cerulean hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <div
              className="flex items-center justify-center gap-4 w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-scienceblue cursor-pointer"
              onClick={signIn}
            >
              Log In
              {loading && <div className="spinner-3"></div>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}