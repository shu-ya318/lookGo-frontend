import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface RequiredFieldLabelProps {
  label: string;
  disabled?: boolean;
}

// 必填欄位標籤：欄位名稱加上紅色星號
export const RequiredFieldLabel = ({
  label,
  disabled = false,
}: RequiredFieldLabelProps) => {
  return (
    <Typography
      variant='body2'
      color={disabled ? 'text.disabled' : 'text.secondary'}
    >
      {label}
      <Box component='span' sx={{ color: 'error.main', ml: 0.25 }}>
        *
      </Box>
    </Typography>
  );
};
