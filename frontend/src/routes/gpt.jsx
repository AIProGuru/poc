import PrivateRoute from "../components/private-routes/PrivateRoutes";
import RCMGPT from "../components/demo-layout/rebound_dash/GPT";
import { ALL_ROLES } from "../utils/roles";

const AUTH_ROLES = ALL_ROLES;

const gptRoutes = [
  {
    path: "",
    element: <PrivateRoute role={AUTH_ROLES} element={RCMGPT} />
  },
];

export default gptRoutes;
