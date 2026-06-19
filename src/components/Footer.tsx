import { NavLink, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

import { ImageBox } from './ImageBox';

import logo from '@/assets/logo_transparent.png';

export const Footer = () => {
    const footerItems = [
        { name: '路網圖查詢', path: '/network-map' },
        { name: '車站聊天室', path: '/chat-room' },
        { name: '客製化旅程', path: '/trip-planner' },
        { name: '車站書籤', path: '/station-bookmark' }
    ];

    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                backgroundColor: 'tertiary.dark',
                py: { xs: 4, md: 6 },
                px: { xs: 2, sm: 4, md: 6 },
                mt: 'auto',
                boxSizing: 'border-box',
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 3, sm: 2 }}
                sx={{
                    width: '100%',
                    maxWidth: '768px',
                    margin: '0 auto',
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {/* Left side: Logo */}
                <NavLink to={'/'} style={{ textDecoration: 'none', marginRight: '.25rem' }}>
                    <ImageBox
                        width='10rem'
                        height='2rem'
                        src={logo}
                        alt='logo'
                        objectFit='cover'

                    />
                </NavLink>
                {/* Right side: Navigation links */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 4 }}
                    sx={{ alignItems: 'center' }}
                >
                    {footerItems.map((item) => (
                        <Link
                            key={item.name}
                            component={RouterLink}
                            to={item.path}
                            underline="none"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'primary.main',
                                },
                            }}
                        >
                            {item.name}
                        </Link>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
};
