import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import { Header } from '@/components/header/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { name: '路網圖查詢', path: '/network-map' },
    { name: '車站聊天室', path: '/chat-room' },
    { name: '客製化旅程', path: '/trip-planner' },
    { name: '車站書籤', path: '/station-bookmark' }
  ];

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        padding: 0,
      }}
    >
      <Header onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isOpen={isSidebarOpen}
        items={sidebarItems}
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
          px: { xs: 2, sm: 4, md: 6 },
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </Stack>
      <Footer />
    </Stack>
  );
};
