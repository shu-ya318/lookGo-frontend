import { useRef, useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { zoom, type ZoomBehavior } from 'd3-zoom';
import { line as d3Line, curveCatmullRom } from 'd3-shape';
import { easeBackOut, easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import type { PositionedLine, PositionedStation } from './computeLayout';

const SVG_W = 1800;
const SVG_H = 1000;
const NODE_R = 8;
const NODE_R_TRANSFER = 13;
const LINE_W = 8;
const LABEL_OFFSET = 26;
const CODE_W = 36;
const CODE_H = 16;
const CODE_R = 4;

function color(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
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

    const lineGen = d3Line<PositionedStation>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(curveCatmullRom.alpha(0.5));

    lines.forEach((posLine, lineIdx) => {
      const c = color(posLine.color);
      const baseDelay = lineIdx * 250;

      // ── ① 路線路徑 ───────────────────────────
      const pathData = lineGen(posLine.stations) ?? '';
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

      // ── ② 終點方塊標誌（先畫，才不蓋到圓點）─
      [posLine.stations[0], posLine.stations[posLine.stations.length - 1]].forEach(
        (s) => {
          root
            .append('rect')
            .attr('x', s.x - 16)
            .attr('y', s.y - 16)
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
            .attr('x', s.x)
            .attr('y', s.y + 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', 9)
            .attr('font-weight', '800')
            .attr('font-family', 'monospace')
            .attr('pointer-events', 'none')
            .attr('opacity', 0)
            .text(posLine.letter)
            .transition()
            .delay(baseDelay + 1300)
            .duration(300)
            .attr('opacity', 1);
        }
      );

      // ── ③ 站點圓圈 ───────────────────────────
      const stationG = root
        .append('g')
        .attr('class', `stations-${posLine.letter}`);

      const circles = stationG
        .selectAll<SVGCircleElement, PositionedStation>('circle')
        .data(posLine.stations)
        .join('circle')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 0)
        .attr('fill', (d) => (d.isTransfer ? '#fff' : c))
        .attr('stroke', c)
        .attr('stroke-width', (d) => (d.isTransfer ? 3 : 1.5))
        .attr('cursor', 'pointer')
        .on('mouseenter', function (event: MouseEvent, d) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (select(this) as any)
            .transition()
            .duration(120)
            .attr('r', (d.isTransfer ? NODE_R_TRANSFER : NODE_R) * 1.4);

          const wrap = wrapRef.current;
          if (!wrap) return;
          const rect = wrap.getBoundingClientRect();
          setTooltip({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            station: d,
            line: posLine,
          });
        })
        .on('mousemove', function (event: MouseEvent) {
          const wrap = wrapRef.current;
          if (!wrap) return;
          const rect = wrap.getBoundingClientRect();
          setTooltip((prev) =>
            prev
              ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top }
              : null
          );
        })
        .on('mouseleave', function (_: MouseEvent, d) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (select(this) as any)
            .transition()
            .duration(120)
            .attr('r', d.isTransfer ? NODE_R_TRANSFER : NODE_R);
          setTooltip(null);
        })
        .on('click', (_: MouseEvent, d) => {
          onStationClick(d, posLine);
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (circles as any)
        .transition()
        .delay((_: unknown, i: number) => baseDelay + 1200 + i * 20)
        .duration(280)
        .ease(easeBackOut)
        .attr('r', (d: PositionedStation) => (d.isTransfer ? NODE_R_TRANSFER : NODE_R));

      // ── ④ 站名標籤（上下交錯）───────────────
      const labelG = root
        .append('g')
        .attr('class', `labels-${posLine.letter}`)
        .attr('pointer-events', 'none');

      posLine.stations.forEach((s, i) => {
        const above = i % 2 === 0;
        const dir = above ? -1 : 1;
        const baseY = s.y + dir * LABEL_OFFSET;

        const g = labelG.append('g').attr('opacity', 0);

        // 站碼 badge
        const codeY = baseY + (above ? -CODE_H - 2 : 2);
        g.append('rect')
          .attr('x', s.x - CODE_W / 2)
          .attr('y', codeY)
          .attr('width', CODE_W)
          .attr('height', CODE_H)
          .attr('rx', CODE_R)
          .attr('fill', c);

        g.append('text')
          .attr('x', s.x)
          .attr('y', codeY + CODE_H / 2 + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', 8)
          .attr('font-family', 'monospace')
          .attr('font-weight', '700')
          .text(s.stationCode);

        // 中文站名
        const nameY = above ? codeY - 6 : codeY + CODE_H + 14;
        g.append('text')
          .attr('x', s.x)
          .attr('y', nameY)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1a1a2e')
          .attr('font-size', 11)
          .attr('font-weight', s.isTransfer ? '700' : '400')
          .attr('font-family', 'system-ui, "PingFang TC", sans-serif')
          .text(s.nameZhTw);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g as any)
          .transition()
          .delay(baseDelay + 1200 + i * 20 + 150)
          .duration(200)
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
