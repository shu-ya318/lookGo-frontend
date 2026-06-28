import { useRef, useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { zoom, type ZoomBehavior } from 'd3-zoom';
import { line as d3Line, curveLinear } from 'd3-shape';
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import type { PositionedLine, PositionedStation } from './computeLayout';
import type { Waypoint } from './linePathConfig';

const SVG_W = 1000;
const SVG_H = 1000;
const LINE_W = 8;
const CODE_W = 36;
const CODE_H = 16;
const CODE_R = 4;
const BADGE_STROKE = '#E3002C';

function color(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
}

function pointToSegDist(
  px: number,
  py: number,
  a: Waypoint,
  b: Waypoint
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - a.x, py - a.y);
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

function isHorizontalSegment(
  sx: number,
  sy: number,
  waypoints: Waypoint[]
): boolean {
  let bestSeg = 0;
  let minDist = Infinity;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = pointToSegDist(sx, sy, waypoints[i], waypoints[i + 1]);
    if (d < minDist) {
      minDist = d;
      bestSeg = i;
    }
  }
  return (
    Math.abs(waypoints[bestSeg + 1].x - waypoints[bestSeg].x) >
    Math.abs(waypoints[bestSeg + 1].y - waypoints[bestSeg].y)
  );
}

interface TooltipState {
  x: number;
  y: number;
  station: PositionedStation;
  line: PositionedLine;
}

interface Props {
  lines: PositionedLine[];
  onStationClick: (station: PositionedStation, line: PositionedLine) => void;
}

export function MetroMapCanvas({ lines, onStationClick }: Props): React.ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    if (!svgRef.current || lines.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const root = svg.append('g').attr('class', 'root');

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> =
      zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 8])
        .on('zoom', (e) => root.attr('transform', e.transform));

    svg.call(zoomBehavior).on('dblclick.zoom', null);

    const waypointLineGen = d3Line<Waypoint>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(curveLinear);

    lines.forEach((posLine, lineIdx) => {
      const c = color(posLine.color);
      const baseDelay = lineIdx * 250;
      const { stations } = posLine;

      // ── ① 路軌 path（沿 waypoints）────────────────────────────
      const pathData = waypointLineGen(posLine.waypoints) ?? '';
      const pathEl = root
        .append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', c)
        .attr('stroke-width', LINE_W)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      const totalLen = (pathEl.node() as SVGPathElement).getTotalLength();
      pathEl
        .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen)
        .transition()
        .delay(baseDelay)
        .duration(1200)
        .ease(easeCubicInOut)
        .attr('stroke-dashoffset', 0);

      // ── ② 終點 R 方塊（固定在 waypoints 兩端，僅主線渲染）──────
      // 支線（stations.length === 1）不繪製終點方塊
      if (stations.length > 1) {
        const terminalPositions = [
          posLine.waypoints[0],
          posLine.waypoints[posLine.waypoints.length - 1],
        ];
        terminalPositions.forEach((pos) => {
          root
            .append('rect')
            .attr('x', pos.x - 16)
            .attr('y', pos.y - 16)
            .attr('width', 32)
            .attr('height', 32)
            .attr('rx', 5)
            .attr('fill', c)
            .attr('opacity', 0)
            .transition()
            .delay(baseDelay + 1300)
            .duration(300)
            .attr('opacity', 1);

          root
            .append('text')
            .attr('x', pos.x)
            .attr('y', pos.y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#fff')
            .attr('font-size', 11)
            .attr('font-weight', '800')
            .attr('font-family', 'monospace')
            .attr('pointer-events', 'none')
            .attr('opacity', 0)
            .text('R')
            .transition()
            .delay(baseDelay + 1300)
            .duration(300)
            .attr('opacity', 1);
        });
      }

      // ── ③ 各站 Badge + 站名（含 R28 / R02，全數渲染）──────────
      stations.forEach((s, i) => {

        // 判斷標籤方向；R22A（新北投）強制往下
        const below =
          s.stationCode === 'R22A' ||
          isHorizontalSegment(s.x, s.y, posLine.waypoints);

        const isBold = s.stationCode === 'R13';

        const g = root
          .append('g')
          .attr('class', `station-node station-${s.stationCode}`)
          .attr('transform', `translate(${s.x}, ${s.y})`)
          .attr('opacity', 0);

        // 1. 修正車站序號 Badge (rect) 中心點對齊
        g.append('rect')
          .attr('x', -CODE_W / 2)
          .attr('y', -CODE_H / 2)
          .attr('width', CODE_W)
          .attr('height', CODE_H)
          .attr('rx', CODE_R)
          .attr('fill', '#FFF')
          .attr('stroke', BADGE_STROKE)
          .attr('stroke-width', 2)
          .attr('cursor', 'pointer')
          .on('mouseenter', (event: MouseEvent) => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const rect = wrap.getBoundingClientRect();
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              station: s,
              line: posLine,
            });
          })
          .on('mousemove', (event: MouseEvent) => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const rect = wrap.getBoundingClientRect();
            setTooltip((prev) =>
              prev
                ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top }
                : null
            );
          })
          .on('mouseleave', () => setTooltip(null))
          .on('click', () => onStationClick(s, posLine));

        g.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#000')
          .attr('font-size', 8)
          .attr('font-weight', '700')
          .attr('font-family', 'monospace')
          .attr('pointer-events', 'none')
          .text(s.stationCode);

        // 2. & 4. 根據位置渲染 Label
        if (below) {
          // 水平段
          const isBottomHorizontal = ['R08', 'R07', 'R06', 'R05', 'R04', 'R03', 'R02'].includes(s.stationCode);
          if (isBottomHorizontal) {
            // R08 至 R02: 移至上方，設定 text-anchor="middle" 並給予 dy={-25} (以及 English name 移至更上方)
            g.append('text')
              .attr('x', 0)
              .attr('y', 0)
              .attr('dy', -25)
              .attr('text-anchor', 'middle')
              .attr('fill', '#1a1a2e')
              .attr('font-size', 11)
              .attr('font-weight', isBold ? '700' : '400')
              .attr('font-family', 'system-ui, "PingFang TC", sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameZhTw);

            g.append('text')
              .attr('x', 0)
              .attr('y', 0)
              .attr('dy', -37)
              .attr('text-anchor', 'middle')
              .attr('fill', '#666')
              .attr('font-size', 8)
              .attr('font-family', 'system-ui, sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameEn);
          } else {
            // 正常水平段：下方
            g.append('text')
              .attr('x', 0)
              .attr('y', 20)
              .attr('text-anchor', 'middle')
              .attr('fill', '#1a1a2e')
              .attr('font-size', 11)
              .attr('font-weight', isBold ? '700' : '400')
              .attr('font-family', 'system-ui, "PingFang TC", sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameZhTw);

            g.append('text')
              .attr('x', 0)
              .attr('y', 32)
              .attr('text-anchor', 'middle')
              .attr('fill', '#666')
              .attr('font-size', 8)
              .attr('font-family', 'system-ui, sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameEn);
          }
        } else {
          // 垂直段
          const isLeftVertical = ['R28', 'R27', 'R26', 'R25'].includes(s.stationCode);
          if (isLeftVertical) {
            // R28 至 R25: 移至左側，設定 text-anchor="end" 並給予 dx={-20}
            g.append('text')
              .attr('x', 0)
              .attr('y', -5)
              .attr('dx', -20)
              .attr('text-anchor', 'end')
              .attr('fill', '#1a1a2e')
              .attr('font-size', 11)
              .attr('font-weight', isBold ? '700' : '400')
              .attr('font-family', 'system-ui, "PingFang TC", sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameZhTw);

            g.append('text')
              .attr('x', 0)
              .attr('y', 7)
              .attr('dx', -20)
              .attr('text-anchor', 'end')
              .attr('fill', '#666')
              .attr('font-size', 8)
              .attr('font-family', 'system-ui, sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameEn);
          } else {
            // 正常垂直段：右側
            g.append('text')
              .attr('x', 0)
              .attr('y', -5)
              .attr('dx', 20)
              .attr('text-anchor', 'start')
              .attr('fill', '#1a1a2e')
              .attr('font-size', 11)
              .attr('font-weight', isBold ? '700' : '400')
              .attr('font-family', 'system-ui, "PingFang TC", sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameZhTw);

            g.append('text')
              .attr('x', 0)
              .attr('y', 7)
              .attr('dx', 20)
              .attr('text-anchor', 'start')
              .attr('fill', '#666')
              .attr('font-size', 8)
              .attr('font-family', 'system-ui, sans-serif')
              .attr('pointer-events', 'none')
              .text(s.nameEn);
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g as any)
          .transition()
          .delay(baseDelay + 1200 + i * 20)
          .duration(250)
          .attr('opacity', 1);
      });
    });
  }, [lines, onStationClick]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#f8fafc',
      }}
    >
      <svg
        ref={svgRef}
        width='100%'
        height='100%'
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio='xMidYMid meet'
        style={{ display: 'block' }}
      />

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y - 90,
            transform: 'translateX(-50%)',
            background: '#1a1a2e',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 14px',
            pointerEvents: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            zIndex: 20,
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {tooltip.station.nameZhTw}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
            {tooltip.station.nameEn}
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span
              style={{
                background: color(tooltip.line.color),
                color: '#fff',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              {tooltip.station.stationCode}
            </span>
            {tooltip.station.isTransfer && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '2px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                轉乘站
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
