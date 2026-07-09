import Box from '@mui/material/Box';

import { MetroMapContainer } from '@/components/metroMap/MetroMapContainer';
import { SearchBarSection } from '@/components/metroMap/SearchBarSection';

const HEADER_HEIGHT = '4.375rem';

const MetroMapPage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: `calc(100vh - ${HEADER_HEIGHT})`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'tertiary.light',
      }}
    >
      {/* 搜尋區塊 */}
      <SearchBarSection />
      {/* 路網圖 */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MetroMapContainer />
      </Box>
    </Box>
  );
};

export default MetroMapPage;
