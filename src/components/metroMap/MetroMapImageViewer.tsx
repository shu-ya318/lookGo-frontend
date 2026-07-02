import { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { zoom, type ZoomBehavior } from "d3-zoom";
import "d3-transition";

import Box from "@mui/material/Box";

import metroMapImg from "../../assets/trtc_map.jpg";
import { useStationStore } from "@/stores/stationStore";
import { STATION_PERCENT_POSITIONS } from "./stationHotspots";

import type { MetroMapLine } from "@/services/metro/interface";

const MAP_BASE_WIDTH = 5669;
const MAP_BASE_HEIGHT = 7710;

interface Props {
  lines: MetroMapLine[];
}

export function MetroMapImageViewer({ lines }: Props): React.ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const selectAndFetchStation = useStationStore(
    (state) => state.selectAndFetchStation
  );

  useEffect(() => {
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (!svgEl || !gEl) return;

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<
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

              const buttonSize = 40;
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
                      // background: "rgba(255, 0, 0, 0.4)",
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
