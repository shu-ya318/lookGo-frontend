import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import placeholderImg from '@/assets/placeholder.png';

interface BookmarkItem {
    id: number;
    stationName: string;
    facility: string;
    exit: string;
}

const mockBookmarks: BookmarkItem[] = [
    { id: 1, stationName: '台北車站', facility: '電梯', exit: '出口 1' },
    { id: 2, stationName: '中山站', facility: '手扶梯', exit: '出口 3' },
    { id: 3, stationName: '板橋站', facility: '無障礙設施', exit: '出口 2' },
    { id: 4, stationName: '西門站', facility: '廁所', exit: '出口 6' },
];

const StationBookmarkPage = () => {
    const handlePrint = () => {
        // TODO
    };

    const handleDownload = () => {
        // TODO
    };

    const handleDelete = (_id: number) => {
        // TODO
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '2rem',
            }}
        >
            <Stack
                sx={{
                    alignItems: 'center',
                    gap: '1rem',
                    py: 3,
                    backgroundColor: 'quaternary.dark',
                    borderRadius: 2,
                }}
            >
                <Typography variant='h5'>車站書籤</Typography>
                <Stack direction='row' sx={{ gap: 2 }}>
                    <Button
                        variant='outlined'
                        color='neutral'
                        onClick={handlePrint}
                    >
                        列印
                    </Button>
                    <Button
                        variant='outlined'
                        color='neutral'
                        onClick={handleDownload}
                    >
                        下載
                    </Button>
                </Stack>
            </Stack>

            <Stack
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {mockBookmarks.map((bookmark, index) => (
                    <Stack key={bookmark.id}>
                        {index > 0 && (
                            <Divider sx={{ borderColor: 'tertiary.dark' }} />
                        )}
                        <Stack
                            direction='row'
                            sx={{
                                alignItems: 'center',
                                px: 4,
                                py: 3,
                                backgroundColor: 'tertiary.dark',
                            }}
                        >
                            <Avatar
                                src={placeholderImg}
                                variant='circular'
                                sx={{
                                    width: 64,
                                    height: 64,
                                    mr: 3,
                                    flexShrink: 0,
                                }}
                            />
                            <Stack sx={{ flex: 1, gap: 0.5 }}>
                                <Typography
                                    variant='body2'
                                    sx={{ fontWeight: 700 }}
                                >
                                    {bookmark.stationName}
                                </Typography>
                                <Typography variant='body2'>
                                    {bookmark.facility}
                                </Typography>
                                <Typography variant='body2'>
                                    {bookmark.exit}
                                </Typography>
                            </Stack>
                            <IconButton
                                size='small'
                                onClick={() => handleDelete(bookmark.id)}
                            >
                                <DeleteOutlinedIcon fontSize='small' />
                            </IconButton>
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
};

export default StationBookmarkPage;
