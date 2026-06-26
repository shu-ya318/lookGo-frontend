import { createBrowserRouter, Navigate, redirect } from "react-router-dom";

import { useAuthStore } from "./stores/authStore";
import { useUserStore } from "./stores/userStore";
import { AdminGuard } from "./AdminGuard";

import { getCurrentUser } from "@/services/user";

import { AuthLayout } from "./layouts/AuthLayout";
import { Layout } from "./layouts/Layout";

import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgetPasswordPage from "@/pages/auth/ForgetPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import NotFoundPage from "@/pages/auth/NotFoundPage";
import NotAuthorizedPage from "@/pages/auth/NotAuthorizedPage";

import HomePage from "@/pages/HomePage";
import SettingPage from "@/pages/user/SettingPage";
import NetworkMapPage from "@/pages/station/NetworkMapPage";
import TripPlannerPage from "@/pages/tripPlan/TripPlannerPage";
import StationBookmarkPage from "@/pages/bookmark/StationBookmarkPage";
import ChatRoomPage from "@/pages/chat/ChatRoomPage";
import UserPermissionPage from "@/pages/admin/UserPermissionPage";
import StationManagementPage from "@/pages/admin/StationManagementPage";
import FakeNetworkMapPage from "./pages/station/FakePage";

const getAccessToken = () => useAuthStore.getState().accessToken;

const loadUserInfo = async () => {
  const userInfo = await getCurrentUser();
  useUserStore.setState({ userInfo });

  return userInfo;
};

const authRoutes = {
  path: "/auth",
  element: <AuthLayout />,
  loader: async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return null;
    }

    try {
      const userInfo = await getCurrentUser();
      if (userInfo) {
        return redirect("/");
      }

      return null;
    } catch (error) {
      console.error(error);

      return null;
    }
  },
  children: [
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "signup",
      element: <SignupPage />,
    },
    {
      path: "forget-password",
      element: <ForgetPasswordPage />,
    },
    {
      path: "reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "fake-network-map",
      element: <FakeNetworkMapPage />,
    },
  ],
};

const mainRoutes = {
  path: "/",
  element: <Layout />,
  loader: async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return redirect("/auth/log-in");
    }

    try {
      const userInfo = await loadUserInfo();

      return { userInfo };
    } catch (error) {
      console.error(error);

      return redirect("/auth/log-in");
    }
  },
  children: [
    {
      index: true,
      element: <Navigate to='/home' replace />,
    },
    {
      path: "home",
      element: <HomePage />,
    },
    {
      path: "user-setting",
      element: <SettingPage />,
    },
    {
      path: "network-map",
      element: <NetworkMapPage />,
    },
    {
      path: "trip-planner",
      element: <TripPlannerPage />,
    },
    {
      path: "station-bookmark",
      element: <StationBookmarkPage />,
    },
    {
      path: "station-chat-room",
      element: <ChatRoomPage />,
    },
    {
      path: "admin",
      element: <AdminGuard />,
      children: [
        {
          path: "user-management",
          element: <UserPermissionPage />,
        },
        {
          path: "station-management",
          element: <StationManagementPage />,
        },
      ],
    },
  ],
};

const errorRoutes = [
  {
    path: "/unauthorized",
    element: <NotAuthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter([
  authRoutes,
  mainRoutes,
  ...errorRoutes,
]);
