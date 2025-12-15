import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore/lite";
import { auth, db } from "../FirebaseConfig";

export default function SignUp() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rpassword, setRpassword] = useState("");
  const [role, setRole] = useState("user");
  const [pass, setPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordResult, setPasswordResult] = useState({
    length: false,
    containsNumber: false,
    containsSpecialCharacter: false,
    containsUppercase: false,
    containsLowercase: false,
  });

  const validatePassword = (value) => {
    const results = {
      length: value.length >= 8,
      containsNumber: /\d/.test(value),
      containsSpecialCharacter: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      containsUppercase: /[A-Z]/.test(value),
      containsLowercase: /[a-z]/.test(value)
    };
    setPasswordResult(results);
    return Object.values(results).every(Boolean);
  }

  const onChangePassword = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPass(true);
    validatePassword(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the privacy policy.");
      return;
    }

    if (password !== rpassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password does not meet requirements.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", cred.user.uid), {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: 1,        // pending by default
        client: [],
      });
      toast.success("Account created. You can sign in now.");
      navigate("/signin");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Sign Up
        </h2>
      </div>
        <form
          method="POST"
          className="mx-auto mt-16 max-w-xl sm:mt-20"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <div className='flex gap-4'>
              <div className="flex flex-col w-1/2">
                <label htmlFor="firstname" className="block text-sm font-semibold leading-6 text-gray-900">
                  First Name
                </label>
                <div className="mt-2.5">
                  <input
                    type="text"
                    name="firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    id="firstname"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="flex flex-col w-1/2">
                <label htmlFor="lastname" className="block text-sm font-semibold leading-6 text-gray-900">
                  Last Name
                </label>
                <div className="mt-2.5">
                  <input
                    type="text"
                    name="lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    id="lastname"
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                Email
              </label>
              <div className="mt-2.5">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="role" className="block text-sm font-semibold leading-6 text-gray-900">
                Role
              </label>
              <div className="mt-2.5">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              {/* Password field */}
              <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2.5">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChangePassword}
                  id="password"
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {pass && (
              <div className="sm:col-span-2">
                <div className={passwordResult.length ? 'text-green-600' : 'text-red-600'}>
                  Contains at least 8 letters
                </div>
                <div className={passwordResult.containsNumber ? 'text-green-600' : 'text-red-600'}>
                  Contains at least 1 number
                </div>
                <div className={passwordResult.containsSpecialCharacter ? 'text-green-600' : 'text-red-600'}>
                  Contains at least 1 special character
                </div>
                <div className={passwordResult.containsUppercase ? 'text-green-600' : 'text-red-600'}>
                  Contains at least 1 uppercase letter
                </div>
                <div className={passwordResult.containsLowercase ? 'text-green-600' : 'text-red-600'}>
                  Contains at least 1 lowercase letter
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              {/* Confirm Password field */}
              <label htmlFor="repassword" className="block text-sm font-semibold leading-6 text-gray-900">
                Confirm Password
              </label>
              <div className="mt-2.5">
                <input
                  type="password"
                  name="repassword"
                  value={rpassword}
                  onChange={(e) => setRpassword(e.target.value)}
                  id="repassword"
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex items-center gap-x-3 sm:col-span-2">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-scienceblue cursor-pointer"
                />
              </div>
              <label className="text-sm leading-6 text-gray-600 cursor-pointer">
                By selecting this, you agree to our{" "}
                <a href="#" className="font-semibold text-blue-600">
                  privacy&nbsp;policy
                </a>
                .
              </label>
            </div>
          </div>

          <div className="mt-10">
            <button
              type="submit"
              className="block w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-600/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>
    </div>
  );
}
