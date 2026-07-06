import { Suspense, lazy } from "react";
import PrivateRoute from "../components/private-routes/PrivateRoutes";
import {
  ALL_ROLES,
  CLIENT_MANAGEMENT_ROLES,
  GOVERNANCE_MANAGEMENT_ROLES,
} from "../utils/roles";

const Demo = lazy(() => import("../pages/Demo"));
const ClientManagement = lazy(() => import("../pages/ClientManagement"));
const ClientDashboard = lazy(() => import("../pages/ClientDashboard"));
const TenantDetails = lazy(() => import("../pages/TenantDetails"));
const Edit_client = lazy(() => import("../pages/Client/Edit_client"));
const GovernanceManagement = lazy(() => import("../pages/GovernanceManagement"));
const AppealTemplates = lazy(() => import("../pages/AppealTemplates"));
const AccountSettings = lazy(() => import("../pages/AccountSettings"));

const suspense = (element) => <Suspense fallback={null}>{element}</Suspense>;

const withDemoLayoutAt = (path, roles, Component) => ({
  path,
  element: suspense(<PrivateRoute role={roles} element={Demo} />),
  children: [
    {
      path: "",
      element: suspense(<PrivateRoute role={roles} element={Component} />),
    },
  ],
});

const profileRoutes = [
  withDemoLayoutAt("/clientmanagement", CLIENT_MANAGEMENT_ROLES, ClientManagement),
  withDemoLayoutAt("/client/:clientId", CLIENT_MANAGEMENT_ROLES, ClientDashboard),
  withDemoLayoutAt("/client/:clientId/tenant/:tenantId", CLIENT_MANAGEMENT_ROLES, TenantDetails),
  withDemoLayoutAt("/client/:id/edit", CLIENT_MANAGEMENT_ROLES, Edit_client),
  withDemoLayoutAt("/governance-management", GOVERNANCE_MANAGEMENT_ROLES, GovernanceManagement),
  withDemoLayoutAt("/appeal-templates", GOVERNANCE_MANAGEMENT_ROLES, AppealTemplates),
  withDemoLayoutAt("/account-settings", ALL_ROLES, AccountSettings),
];

export default profileRoutes;
