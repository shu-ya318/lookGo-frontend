import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';

import { Header } from '@/components/header/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

import { useUserStore } from '@/stores/userStore';

import { UserRole } from '@/services/user/types';

const BASE_NAV_ITEMS = [
  { label: '路網圖查詢', path: '/network-map', icon: <MapOutlinedIcon /> },
  {
    label: '車站書籤',
    path: '/station-bookmark',
    icon: <BookmarkBorderIcon />,
  },
  { label: '旅程規劃', path: '/trip-planner', icon: <RouteOutlinedIcon /> },
  {
    label: '車站聊天室',
    path: '/station-chat-room',
    icon: <ChatBubbleOutlineOutlined />,
  },
];

const ADMIN_NAV_ITEMS = [
  {
    label: '使用者管理',
    path: '/admin/user-management',
    icon: <PeopleOutlinedIcon />,
  },
  {
    label: '車站管理',
    path: '/admin/station-management',
    icon: <TrainOutlinedIcon />,
  },
];

export const Layout = () => {
  const { userInfo } = useUserStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = userInfo?.role === UserRole.ADMIN;

  const navItems = isAdmin
    ? [...BASE_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
    : BASE_NAV_ITEMS;

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        padding: 0,
      }}
    >
      <Header
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        navItems={navItems}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        items={navItems}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Stack
        component='main'
        sx={{
          width: '100%',
          margin: '0 auto',
          flex: 1,
          justifyContent: 'flex-start',
          marginTop: '4.375rem',
          backgroundColor: 'background.default',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </Stack>
      <Footer />
    </Stack>
  );
};
