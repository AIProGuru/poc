import { useState,useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../FirebaseConfig";
import { SERVER_URL } from "../utils/config";
import { AccountContext } from "../utils/Account";



function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [emailaddr, setEmailaddr] = useState("");

  const { forgotPassword } = useContext(AccountContext);
  const sendRequest = () => {
    // axios
    //   .post(`${SERVER_URL}/v2/updatepassword`, {
    //     email: emailaddr,
    //   })
    //   .then((res) => {
    //     navigate('/waiting');
    //   })
    //   .catch((err) => {});
    forgotPassword(emailaddr)
        .then((message) => {
            alert(message);
            navigate('/signin');
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
  };

  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Forgot Password
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
              htmlFor="email"
              className="block text-sm font-semibold leading-6 text-gray-900"
            >
              Email
            </label>
            <div className="mt-2.5">
              <input
                type="email"
                name="email"
                value={emailaddr}
                onChange={(e) => setEmailaddr(e.target.value)}
                id="email"
                autoComplete="email"
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={sendRequest}
          >
            Send Request
          </button>
        </div>
      </form>
    </div>
  );
}