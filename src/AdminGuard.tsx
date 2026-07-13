import { Navigate, Outlet } from 'react-router-dom';

import { useUserStore } from './stores/userStore';

import { UserRole } from '@/services/user/types';

export const AdminGuard = () => {
  const role = useUserStore((state) => state.userInfo?.role);

  if (role !== UserRole.ADMIN) {
    return <Navigate to='/unauthorized' replace />;
  }

  return <Outlet />;
};
