import { useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SendIcon from '@mui/icons-material/Send';

interface StationOption {
    label: string;
    group: string;
}

const bookmarkedStations: StationOption[] = [
    { label: '淡水站', group: '車站書籤' },
    { label: '民權西路站', group: '車站書籤' },
];

const allStationList: StationOption[] = [
    { label: '台北車站', group: '所有車站' },
    { label: '板橋站', group: '所有車站' },
];

const stationOptions: StationOption[] = [
    ...bookmarkedStations,
    ...allStationList,
];

interface SharedTrip {
    title: string;
    startStation: string;
    endStation: string;
}

interface ChatMessage {
    id: number;
    sender: string;
    isSelf: boolean;
    content?: string;
    sharedTrip?: SharedTrip;
    timestamp: string;
}

interface StationData {
    announcement?: string;
    messages: ChatMessage[];
}

/** 以車站名為 key，各站擁有獨立公告（選填）與對話紀錄 */
const stationDataMap: Record<string, StationData> = {
    民權西路站: {
        announcement: '公告：民權西路站出口 10 的電梯臨時故障，造成不便敬請見諒',
        messages: [
            {
                id: 1,
                sender: '小明',
                isSelf: false,
                content: '有人知道出口 10 的電梯什麼時候會修好嗎？',
                timestamp: '10:30',
            },
            {
                id: 2,
                sender: '我',
                isSelf: true,
                content: '聽說要到下週才會修好，可以先走出口 8。',
                timestamp: '10:32',
            },
            {
                id: 3,
                sender: '小華',
                isSelf: false,
                sharedTrip: {
                    title: '台北通勤',
                    startStation: '淡水站',
                    endStation: '民權西路站',
                },
                timestamp: '10:35',
            },
            {
                id: 4,
                sender: '我',
                isSelf: true,
                content: '謝謝分享！',
                timestamp: '10:36',
            },
        ],
    },
    淡水站: {
        messages: [
            {
                id: 1,
                sender: '阿偉',
                isSelf: false,
                content: '淡水站今天人超多，建議提早出門！',
                timestamp: '09:10',
            },
            {
                id: 2,
                sender: '我',
                isSelf: true,
                content: '收到，謝謝提醒！',
                timestamp: '09:12',
            },
        ],
    },
    台北車站: {
        messages: [
            {
                id: 1,
                sender: '小美',
                isSelf: false,
                content: '台北車站 M6 出口旁的便利商店剛開幕！',
                timestamp: '08:45',
            },
        ],
    },
};

const ChatRoomPage = () => {
    const [selectedStation, setSelectedStation] =
        useState<StationOption | null>(null);
    const [inputMessage, setInputMessage] = useState('');

    const stationData = selectedStation
        ? (stationDataMap[selectedStation.label] ?? { messages: [] })
        : null;
    const announcement = stationData?.announcement ?? null;
    const messages = stationData?.messages ?? [];

    const handleSend = (): void => {
        if (!inputMessage.trim()) return;
        setInputMessage('');
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>
    ): void => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: 2,
            }}
        >
            <Typography variant='h5'>車站聊天室</Typography>

            {/* 篩選列 */}
            <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' sx={{ flexShrink: 0 }}>
                    車站
                </Typography>
                <Autocomplete
                    value={selectedStation}
                    onChange={(_event, newValue) =>
                        setSelectedStation(newValue)
                    }
                    options={stationOptions}
                    groupBy={option => option.group}
                    getOptionLabel={option => option.label}
                    isOptionEqualToValue={(option, value) =>
                        option.label === value.label
                    }
                    renderOption={(props, option) => (
                        <li
                            {...props}
                            key={`${option.group}-${option.label}`}
                        >
                            {option.label}
                        </li>
                    )}
                    renderInput={params => (
                        <TextField
                            {...params}
                            placeholder='選擇或搜尋車站'
                            size='small'
                        />
                    )}
                    sx={{ width: 250 }}
                />
            </Stack>

            {/* 聊天區域 */}
            <Stack
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* 公告列 */}
                {announcement && (
                    <Box
                        sx={{
                            backgroundColor: 'quaternary.dark',
                            px: 3,
                            py: 1.5,
                        }}
                    >
                        <Typography variant='body2'>
                            {announcement}
                        </Typography>
                    </Box>
                )}

                {/* 訊息區 */}
                <Stack
                    sx={{
                        backgroundColor: 'tertiary.dark',
                        minHeight: 400,
                        maxHeight: 500,
                        overflowY: 'auto',
                        px: 3,
                        py: 3,
                        gap: 3,
                    }}
                >
                    {!selectedStation ? (
                        <Stack
                            sx={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant='body1'
                                color='text.secondary'
                            >
                                請選擇車站以進入聊天室
                            </Typography>
                        </Stack>
                    ) : messages.length === 0 ? (
                        <Stack
                            sx={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant='body1'
                                color='text.secondary'
                            >
                                目前還沒有任何訊息
                            </Typography>
                        </Stack>
                    ) : (
                        messages.map(message => (
                            <Stack
                                key={message.id}
                                direction='row'
                                sx={{
                                    justifyContent: message.isSelf
                                        ? 'flex-end'
                                        : 'flex-start',
                                    gap: 1.5,
                                }}
                            >
                                {!message.isSelf && (
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            backgroundColor: 'primary.light',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <PersonOutlinedIcon fontSize='small' />
                                    </Avatar>
                                )}

                                <Stack
                                    sx={{
                                        maxWidth: '55%',
                                        gap: 0.5,
                                        alignItems: message.isSelf
                                            ? 'flex-end'
                                            : 'flex-start',
                                    }}
                                >
                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                    >
                                        {message.sender}
                                    </Typography>

                                    {message.sharedTrip ? (
                                        <Card
                                            sx={{
                                                backgroundColor:
                                                    'background.paper',
                                                boxShadow: 'none',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                width: '100%',
                                            }}
                                        >
                                            <CardContent
                                                sx={{
                                                    '&:last-child': { pb: 2 },
                                                }}
                                            >
                                                <Typography
                                                    variant='body2'
                                                    sx={{ fontWeight: 700 }}
                                                >
                                                    {
                                                        message.sharedTrip
                                                            .title
                                                    }
                                                </Typography>
                                                <Typography
                                                    variant='caption'
                                                    color='text.secondary'
                                                >
                                                    {
                                                        message.sharedTrip
                                                            .startStation
                                                    }{' '}
                                                    →{' '}
                                                    {
                                                        message.sharedTrip
                                                            .endStation
                                                    }
                                                </Typography>
                                                <Stack
                                                    direction='row'
                                                    sx={{
                                                        justifyContent:
                                                            'flex-end',
                                                        mt: 1,
                                                    }}
                                                >
                                                    <Button
                                                        size='small'
                                                        variant='text'
                                                    >
                                                        點擊查看
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Box
                                            sx={{
                                                backgroundColor:
                                                    'background.paper',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1.5,
                                            }}
                                        >
                                            <Typography variant='body2'>
                                                {message.content}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontSize: '0.65rem' }}
                                    >
                                        {message.timestamp}
                                    </Typography>
                                </Stack>

                                {message.isSelf && (
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            backgroundColor: 'primary.light',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <PersonOutlinedIcon fontSize='small' />
                                    </Avatar>
                                )}
                            </Stack>
                        ))
                    )}
                </Stack>

                {/* 輸入列 */}
                <Stack
                    direction='row'
                    sx={{
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        backgroundColor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        gap: 1,
                    }}
                >
                    <Button
                        startIcon={<AttachFileIcon />}
                        size='small'
                        color='inherit'
                        sx={{ flexShrink: 0 }}
                    >
                        分享旅程
                    </Button>

                    <Divider
                        orientation='vertical'
                        flexItem
                        sx={{ mx: 0.5 }}
                    />

                    <TextField
                        value={inputMessage}
                        onChange={event => setInputMessage(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='請輸入訊息'
                        size='small'
                        fullWidth
                        variant='standard'
                        slotProps={{
                            input: { disableUnderline: true },
                        }}
                    />

                    <Button
                        endIcon={<SendIcon />}
                        size='small'
                        color='inherit'
                        onClick={handleSend}
                        sx={{ flexShrink: 0 }}
                    >
                        送出訊息
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default ChatRoomPage;
