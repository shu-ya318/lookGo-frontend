import { useRef, useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { zoom, type ZoomBehavior } from 'd3-zoom';
import 'd3-transition';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';

import metroMapImg from '../../assets/trtc_map.jpg';
import { useStationStore } from '@/stores/useStationStore';
import { STATION_PERCENT_POSITIONS } from './stationHotspots';

import type { MetroMapLine } from '@/services/metro/interface';

const MAP_BASE_WIDTH = 5669;;
const MAP_BASE_HEIGHT = 7710;

interface Props {
  lines: MetroMapLine[];
}

function normalizeColor(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
}

export function MetroMapImageViewer({ lines }: Props): React.ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const selectAndFetchStation = useStationStore((state) => state.selectAndFetchStation);
  const currentStationCode = useStationStore((state) => state.currentStationCode);

  useEffect(() => {
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (!svgEl || !gEl) return;

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 10])
      .on('zoom', (e) => {
        select(gEl).attr('transform', e.transform);
      });

    select(svgEl).call(zoomBehavior).on('dblclick.zoom', null);

    return () => {
      select(svgEl).on('.zoom', null);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#e8edf2',
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block', cursor: 'grab' }}
      >
        <g ref={gRef}>
          <image
            href={metroMapImg}
            x={0}
            y={0}
            width={MAP_BASE_WIDTH}
            height={MAP_BASE_HEIGHT}
          />
          {lines
            .flatMap((line) => line.stations)
            .map((station) => {
              const pos = STATION_PERCENT_POSITIONS[station.stationCode];
              if (!pos) return null;

              const buttonSize = 40;
              const xPosition = pos.x - buttonSize / 2;
              const yPosition = pos.y - buttonSize / 2;

              return (
                <foreignObject
                  key={station.stationCode}
                  x={xPosition}
                  y={yPosition}
                  width={buttonSize}
                  height={buttonSize}
                  style={{ pointerEvents: 'auto' }}
                >
                  <button
                    id={station.stationCode}
                    title={`${station.stationCode} ${station.nameZhTw}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      background: 'rgba(255, 0, 0, 0.4)',
                      border: 'none',
                      outline: 'none',
                    }}
                    onClick={() => selectAndFetchStation(station.stationCode)}
                  />
                </foreignObject>
              );
            })}
        </g>
      </svg>

      {/* 路線站點選擇面板 */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0.75,
        }}
      >
        <IconButton
          onClick={() => setPanelOpen((prev) => !prev)}
          size="small"
          sx={{
            background: '#fff',
            boxShadow: 3,
            '&:hover': { background: '#f0f0f0' },
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        <Collapse in={panelOpen} unmountOnExit>
          <Paper
            elevation={6}
            sx={{
              p: 1.5,
              maxHeight: 'calc(100vh - 160px)',
              overflowY: 'auto',
              minWidth: 220,
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              選擇車站
            </Typography>
            <Stack spacing={1.25}>
              {lines.map((line) => {
                const lineColor = normalizeColor(line.color);
                return (
                  <Box key={line.letter}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: lineColor, display: 'block', mb: 0.5 }}
                    >
                      {line.nameZhTw}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {line.stations.map((station) => {
                        const isActive = currentStationCode === station.stationCode;
                        return (
                          <Chip
                            key={station.stationCode}
                            label={station.stationCode}
                            size="small"
                            variant={isActive ? 'filled' : 'outlined'}
                            onClick={() => selectAndFetchStation(station.stationCode)}
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              borderColor: lineColor,
                              color: isActive ? '#fff' : lineColor,
                              backgroundColor: isActive ? lineColor : 'transparent',
                              '&:hover': {
                                backgroundColor: lineColor,
                                color: '#fff',
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Collapse>
      </Box> */}
    </Box>
  );
}
