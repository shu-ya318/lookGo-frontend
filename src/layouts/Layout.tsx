import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { name: '首頁', path: '/' },
  ];

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '1126px',
        height: '100%',
        margin: '0 auto',
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

    </Stack>
  );
};
