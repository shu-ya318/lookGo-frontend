import Box from '@mui/material/Box';

import type { CSSProperties, ReactNode, MouseEvent } from 'react';

interface ImageBoxProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

export const ImageBox = ({
  src,
  alt,
  width = '100%',
  height = '100%',
  objectFit = 'contain',
  objectPosition = 'center',
  style,
  ...imageProps
}: ImageBoxProps) => {
  return (
    <Box
      sx={{
        overflow: 'hidden',
        width: width,
        height: height,
        position: 'relative',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: objectFit,
          objectPosition: objectPosition,
          ...style,
        }}
        {...imageProps}
      />
    </Box>
  );
};
