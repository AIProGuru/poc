import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AccountContext } from "../utils/Account";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseAuthErrors";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useContext(AccountContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailSubmit = async () => {
    const normalizedEmail = `${email || ""}`.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(normalizedEmail);
      setSent(true);
      toast.success("If an account exists for that email, a reset link has been sent.");
    } catch (error) {
      toast.error(getFirebaseAuthErrorMessage(error, "Unable to send reset email. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="mb-6">
          <button onClick={() => navigate('/signin')} className="text-gray-600 hover:text-gray-800">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-orange-500 mb-2">Forgot Password?</h1>

        {!sent ? (
          <>
            <p className="text-gray-600 mb-8">
              Enter your email and we&apos;ll send you a secure link to reset your password.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-orange-500 text-lg font-normal">@</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: abc@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleEmailSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                Send Reset Link
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600">
              Check your inbox for a password reset link. If you do not see it, check your spam folder.
            </p>
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl transition-all duration-200"
            >
              Back to Sign In
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/signin" className="text-orange-500 hover:text-orange-600 underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
