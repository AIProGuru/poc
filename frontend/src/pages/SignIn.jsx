import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

import { AccountContext } from "../utils/Account";
import {
  setAuth,
  setUsername,
  setRole,
  setFirstname,
  setLastname,
  setPermission,
} from "../redux/reducers/auth.reducer";

export default function SignIn() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { authenticate } = useContext(AccountContext);

  const signIn = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authenticate(user, password);
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
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Back Arrow */}
        <div className="mb-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Login</h1>
        <p className="text-gray-600 mb-8">Login now to track all your expenses and income at a place!</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-orange-500 text-lg font-normal">@</span>
              </div>
              <input
                type="email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyDown={(e) => e.keyCode === 13 && signIn()}
                placeholder="Ex: abc@example.com"
                className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Your Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#FF6B35" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="1" fill="#FF6B35"/>
                  <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="#FF6B35" strokeWidth="2"/>
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.keyCode === 13 && signIn()}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-left">
            <Link to="/forgot-password" className="text-orange-500 hover:text-orange-600 text-sm underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            onClick={signIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            Login
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          </button>

          {/* Divider */}
          <div className="w-full border-t border-gray-300"></div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Contact Sales Rep */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account? <Link to="/contact" className="font-bold text-orange-500 hover:text-orange-600 underline">Contact a Sales Rep</Link>
          </div>
        </form>
      </div>
    </div>
  );
}