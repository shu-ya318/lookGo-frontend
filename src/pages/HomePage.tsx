import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';

import { StationAutocomplete } from '@/components/StationAutocomplete';

import type { StationOption } from '@/services/metro/interface';

import trtcBanner from '@/assets/trtc_banner.jpg';

const featureSections = [
  {
    title: '路網圖查詢',
    subtitle: '互動式路網圖',
    description:
      '透過動態路網圖，輕鬆瀏覽臺北捷運各站資訊，快速掌握路線與轉乘方式。',
    path: '/network-map',
    icon: <MapOutlinedIcon sx={{ fontSize: { xs: 40, md: 56 } }} />,
  },
  {
    title: '車站書籤',
    subtitle: '收藏常用車站',
    description: '將常用或感興趣的車站加入書籤，隨時快速查看車站資訊。',
    path: '/station-bookmark',
    icon: <BookmarkBorderIcon sx={{ fontSize: { xs: 40, md: 56 } }} />,
  },
  {
    title: '旅程規劃',
    subtitle: '專屬旅程規劃',
    description: '依據您的需求客製化規劃捷運旅程，打造最適合您的出行路線。',
    path: '/trip-planner',
    icon: <RouteOutlinedIcon sx={{ fontSize: { xs: 40, md: 56 } }} />,
  },
  {
    title: '車站聊天室',
    subtitle: '即時交流平台',
    description:
      '在車站專屬聊天室中與其他旅客即時交流，分享搭乘心得與周邊資訊。',
    path: '/station-chat-room',
    icon: <ChatBubbleOutlineOutlined sx={{ fontSize: { xs: 40, md: 56 } }} />,
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  const [selectedStation, setSelectedStation] = useState<StationOption | null>(
    null,
  );

  const handleSearch = (station: StationOption | null) => {
    setSelectedStation(station);

    if (station) {
      navigate(`/network-map?search=${encodeURIComponent(station.nameZhTw)}`);
    }
  };

  return (
    <Box>
      {/* 橫幅區塊 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          minHeight: '640px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <Box
          component='img'
          src={trtcBanner}
          alt='背景圖片'
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.13)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            pr: { xs: 4, md: 10 },
            pl: { xs: 4, md: 0 },
            py: 6,
            maxWidth: '600px',
          }}
        >
          <Typography
            variant='h4'
            sx={{
              color: '#FFFFFF',
              mb: 1.5,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            查詢您有興趣的臺北捷運車站
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 4,
            }}
          >
            使用 LookGo 讓您查完立即出發
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '28px',
              px: 2,
              py: 0.5,
            }}
          >
            <StationAutocomplete
              value={selectedStation}
              onChange={handleSearch}
              disableClearable
              placeholder='您想找哪個臺北捷運車站?'
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  paddingTop: 0,
                  paddingBottom: 0,
                  '& fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.95rem',
                  py: 1,
                },
              }}
            />

          </Box>
        </Box>
      </Box>
      {/* 功能介紹區塊 */}
      {featureSections.map((section) => {
        // const isOdd = index % 2 === 0;

        const imageBlock = (
          <Box
            sx={{
              flex: '0 0 auto',
              width: { xs: '100%', md: '35%' },
              display: 'flex',
              // justifyContent: isOdd ? "flex-start" : "flex-end",
              justifyContent: 'center',
              alignItems: 'center',
              py: { xs: 2, md: 0 },
            }}
          >
            <Box
              sx={{
                width: { xs: 88, md: 120 },
                height: { xs: 88, md: 120 },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'primary.main',
                backgroundColor: 'primary.light',
                opacity: 0.9,
                // borderRadius: isOdd ? "16px 0 16px 0" : "0 16px 0 16px",
                borderRadius: '16px 0 16px 0',
              }}
            >
              {section.icon}
            </Box>
          </Box>
        );
        const textBlock = (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              px: { xs: 2, md: 4 },
              py: { xs: 2, md: 0 },
            }}
          >
            <Typography variant='h6' sx={{ mb: 0.5, color: 'neutral.dark' }}>
              {section.title}
            </Typography>
            <Typography
              variant='caption'
              sx={{ mb: 1, color: 'secondary.dark' }}
            >
              {section.subtitle}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                mb: 2,
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '0.8125rem',
              }}
            >
              {section.description}
            </Typography>
            <Box>
              <Button
                variant='contained'
                color='primary'
                size='small'
                onClick={() => navigate(section.path)}
                sx={{
                  borderRadius: '6px',
                  px: 2.5,
                  py: 0.75,
                }}
              >
                立即前往
              </Button>
            </Box>
          </Box>
        );

        return (
          <Box
            key={section.title}
            sx={{
              maxWidth: '960px',
              display: 'flex',
              flexDirection: {
                xs: 'column',
                // md: isOdd ? "row" : "row-reverse",
                md: 'row',
              },
              alignItems: 'center',
              // backgroundColor:
              //   index % 2 === 0 ? "quaternary.main" : "background.default",
              margin: '0 auto',
              py: { xs: 3, md: 4 },
              px: { xs: 2, md: 8 },
            }}
          >
            {imageBlock}
            {textBlock}
          </Box>
        );
      })}
    </Box>
  );
};

export default HomePage;
