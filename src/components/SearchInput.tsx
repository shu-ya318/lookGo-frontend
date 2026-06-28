import FormControl from '@mui/material/FormControl';
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import type { ChangeEvent } from 'react';


interface SearchInputProps {
  width?: string;
  searchTerm: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const SearchInput = ({ width = '12.5rem', searchTerm, onChange }: SearchInputProps) => {

  return (
    <FormControl sx={{ width }} variant='filled'>
      <FilledInput
        id='searchInput'
        type='text'
        disableUnderline={true}
        placeholder={'搜尋'}
        fullWidth
        startAdornment={
          <InputAdornment position='end'>
            <SearchOutlinedIcon sx={{ fontSize: '.875rem', marginRight: '0.25rem' }} />
          </InputAdornment>
        }
        sx={{ height: '1.75rem', paddingLeft: 0, fontSize: '.875rem' }}
        value={searchTerm}
        onChange={onChange}
      />
    </FormControl>
  );
};
