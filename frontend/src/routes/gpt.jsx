import PrivateRoute from "../components/private-routes/PrivateRoutes";
import RCMGPT from "../components/demo-layout/rebound_dash/GPT";

const gptRoutes = [
  {
    path: "",
    element: <PrivateRoute role={['demo', 'admin']} element={RCMGPT} />
  },
];

export default gptRoutes;