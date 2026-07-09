import { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import "d3-transition";

import Box from "@mui/material/Box";

import { useStationStore } from "@/stores/stationStore";
import { STATION_PERCENT_POSITIONS } from "./stationHotspots";

import type { MetroMapLine } from "@/services/metro/interface";

import metroMapImg from "../../assets/trtc_map.jpg";

const MAP_BASE_WIDTH = 5669;
const MAP_BASE_HEIGHT = 7710;

interface Props {
  lines: MetroMapLine[];
}

export const MetroMapImageViewer = ({ lines }: Props) => {
  const selectAndFetchStation = useStationStore(
    (state) => state.selectAndFetchStation
  );

  // 取得 DOM 節點讓 d3.js 去綁定事件，另外也避免頻繁拖曳、縮放時觸發重新渲染
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // 自動處理拖曳、縮放操作
  useEffect(() => {
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (!svgEl || !gEl) return;

    const zoomBehavior = zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([0.3, 10])
      .on("zoom", (event) => {
        select(gEl).attr("transform", event.transform);
      });

    select(svgEl).call(zoomBehavior).on("dblclick.zoom", null);

    return () => {
      select(svgEl).on(".zoom", null);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#e8edf2",
      }}
    >
      <svg
        ref={svgRef}
        width='100%'
        height='100%'
        style={{ display: "block", cursor: "grab" }}
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
              const positions = STATION_PERCENT_POSITIONS[station.stationCode];
              if (!positions) return null;

              const buttonSize = 70;
              const xPosition = positions.x - buttonSize / 2;
              const yPosition = positions.y - buttonSize / 2;

              return (
                <foreignObject
                  key={station.stationCode}
                  x={xPosition}
                  y={yPosition}
                  width={buttonSize}
                  height={buttonSize}
                  style={{ pointerEvents: "auto" }}
                >
                  <button
                    id={station.stationCode}
                    title={`${station.stationCode} ${station.nameZhTw}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                    }}
                    onClick={() => selectAndFetchStation(station.stationCode)}
                  />
                </foreignObject>
              );
            })}
        </g>
      </svg>
    </Box>
  );
}
