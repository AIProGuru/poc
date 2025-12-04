import { useRoutes } from "react-router-dom";
import { useEffect, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import routesConfig from "./routes";
import { MAINTAINING } from "./utils/config";
import {
  setAuth,
  setUsername,
  setRole,
  setFirstname,
  setLastname,
  setPermission,
  setEmail,
} from "./redux/reducers/auth.reducer";
import { useApiEndpoint } from "./ApiEndpointContext";
import {
  setShowGPT,
} from "./redux/reducers/gpt.reducer";
import { AccountContext } from "./utils/Account";
import { increaseLoading, decreaseLoading, setTagLoading } from "./redux/reducers/app.reducer";
import ChatBot from "./components/demo-layout/rebound_dash/ChatBot";
import ChatBotButton from "./components/demo-layout/rebound_dash/ChatBotButton";

const showlist = [
  '/',
  '',
  '/features',
  '/about',
  '/contact',
  '/careers',
  '/whitepaper',
  '/signin',
  '/signup',
  '/calculate_savings',
  '/testimonial',
];

function App() {
  const location = useLocation();
  const { getSession } = useContext(AccountContext);
  const apiUrl = useApiEndpoint();
  // if (apiUrl === '') {
  //   apiUrl = 'https://gabeo-website-backend-iimnlunkua-uc.a.run.app';
  // }
  const dispatch = useDispatch();
  const routes = useRoutes(routesConfig);
  const isLoading = useSelector((state) => state.app.loading)
  const showChatBot = useSelector((state) => state.gpt.showGPT)
  const chatbot = useRef(null);
  const getAuth = useSelector((state) => state.auth.isAuthenticated);

  const onCloseChatbot = () => {
    dispatch(setShowGPT(false));
  };

  // useOnClickOutside(chatbot, onCloseChatbot);


  useEffect(() => {

    const timeoutId = setTimeout(() => {
      if (!getAuth) return;
      // Extract the page_name from the URL
      const url = window.location.pathname;
      const parts = url.split('/').filter(Boolean); // Split by '/' and remove empty parts
      const pageName = parts.length > 1 ? `/${parts[0]}/${parts[1]}` : `/${parts[0]}`; // Join the first two parts if they exist

      // If the URL contains 'detail', extract only up to 'detail'
      const pageNameIndex = url.indexOf('detail');
      const finalPageName = pageNameIndex !== -1 ? url.substring(0, pageNameIndex + 'detail'.length) : pageName;
      if (finalPageName === '/undefined') {
        return;
      }

      console.log(finalPageName);

      // Call the backend endpoint
      // axios.post(`${SERVER_URL}/v2/medevolve/analysis/update-view`, {
      //   page_name: finalPageName,
      // })
      //   .then(response => response.json())
      //   .then(data => {
      //     if (data.error) {
      //       console.error('Error:', data.error);
      //     } else {
      //       console.log('Success:', data);
      //     }
      //   })
      //   .catch((error) => {
      //     console.error('Error:', error);
      //   });
    }, 1000);

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
  }, [getAuth, window.location.pathname]);

  useEffect(() => {
    dispatch(increaseLoading())
    getSession()
      .then((session) => {
        console.log(session)
        dispatch(setAuth(true));
        dispatch(setUsername(session.userData.firstname ?? ""))
        dispatch(setFirstname(session.userData.firstname ?? ""));
        dispatch(setLastname(session.userData.lastname ?? ""));
        dispatch(setEmail(session.userData.email ?? ""));
        dispatch(setRole(session.userData.role ?? ""))
        dispatch(setPermission(""))
        dispatch(decreaseLoading())
      })
      .catch((err) => {
        console.log(err);
        dispatch(setAuth(false));
        dispatch(setUsername(''));
        dispatch(setRole(0));
        dispatch(decreaseLoading())
      })
  }, []);

  return (
    <div className="w-full h-screen">
      {MAINTAINING === 'true' && <div className="flex bg-indigo-400 w-full h-full">
        <div
          role="status"
          className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 text-white text-[48px]"
        >
          Maintaining now...Will come soon!
        </div>
      </div>}
      {MAINTAINING === 'false' || MAINTAINING === undefined && isLoading !== 0 && (
        <div className="flex bg-gradient-to-br from-primary-700 to-primary-900 w-full h-full">
          <div
            role="status"
            className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
          >
            <svg
              aria-hidden="true"
              className="w-20 h-20 text-primary-200 animate-spin fill-primary-500"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <div>
            <img
              src="/favicon.png"
              alt=""
              className="max-h-[36px] absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
            />
          </div>
        </div>
      )}
      {(MAINTAINING === 'false' || MAINTAINING === undefined) && isLoading === 0 && (
        <div className="flex flex-col h-full">
          <div className="block md:hidden">
            {location.pathname.startsWith('/rcmgpt') === false && <ChatBotButton />}
          </div>
          {showChatBot && <div
            className="fixed md:left-[300px] md:bottom-4 z-[55] w-[100vw] md:w-[600px] flex flex-col drop-shadow-md bg-white md:bg-[#EFF4FE] rounded-none md:rounded-2xl md:mb-2 h-[100vh] md:h-auto"
          // ref={chatbot}
          >
            <ChatBot />
          </div>}
          {/* {showlist.indexOf(location.pathname) !== -1 && <Header />} */}
          <div className="flex-1">{routes}</div>
          {/* <Footer /> */}
        </div>
      )}
    </div>
  );
}

export default App;