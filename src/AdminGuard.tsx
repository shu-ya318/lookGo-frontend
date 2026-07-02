import { Navigate, Outlet } from "react-router-dom";

import { useUserStore } from "./stores/userStore";

export const AdminGuard = () => {
  const role = useUserStore((state) => state.userInfo?.role);

  if (role !== "ADMIN") {
    return <Navigate to='/unauthorized' replace />;
  }

  return <Outlet />;
};
