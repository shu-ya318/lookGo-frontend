import type { MetroMapLine, MetroMapStation } from '@/services/metro/interface';
import {
  LINE_PATH_CONFIGS,
  getFallbackConfig,
  type Waypoint,
} from './linePathConfig';

export interface PositionedStation extends MetroMapStation {
  x: number;
  y: number;
  isTransfer: boolean;
}

export interface PositionedLine {
  letter: string;
  color: string;
  nameZhTw: string;
  nameEn: string;
  waypoints: Waypoint[];
  stations: PositionedStation[];
}

function buildTransferSet(lines: MetroMapLine[]): Set<string> {
  const count = new Map<string, number>();
  for (const line of lines) {
    for (const s of line.stations) {
      count.set(s.nameZhTw, (count.get(s.nameZhTw) ?? 0) + 1);
    }
  }
  return new Set(
    [...count.entries()].filter(([, c]) => c >= 2).map(([name]) => name)
  );
}

function cumDistances(waypoints: Waypoint[]): number[] {
  const acc: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dy = waypoints[i].y - waypoints[i - 1].y;
    acc.push(acc[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return acc;
}

function pointAtT(
  waypoints: Waypoint[],
  cumDist: number[],
  t: number
): { x: number; y: number } {
  const total = cumDist[cumDist.length - 1];
  if (total === 0) return waypoints[0];

  const d = Math.min(t * total, total);
  for (let i = 1; i < cumDist.length; i++) {
    if (d <= cumDist[i] || i === cumDist.length - 1) {
      const segLen = cumDist[i] - cumDist[i - 1];
      const ratio = segLen > 0 ? (d - cumDist[i - 1]) / segLen : 0;
      return {
        x: waypoints[i - 1].x + ratio * (waypoints[i].x - waypoints[i - 1].x),
        y: waypoints[i - 1].y + ratio * (waypoints[i].y - waypoints[i - 1].y),
      };
    }
  }
  return waypoints[waypoints.length - 1];
}

export function computeLayout(lines: MetroMapLine[]): PositionedLine[] {
  const transferSet = buildTransferSet(lines);
  let fallbackIndex = 0;

  return lines.map((line) => {
    const config =
      LINE_PATH_CONFIGS[line.letter] ?? getFallbackConfig(fallbackIndex++);
    const { waypoints } = config;
    const cumDist = cumDistances(waypoints);

    const sorted = [...line.stations].sort((a, b) => a.sequence - b.sequence);
    const n = sorted.length;

    const stations: PositionedStation[] = sorted.map((s, i) => {
      const t = n <= 1 ? 0.5 : i / (n - 1);
      const { x, y } = pointAtT(waypoints, cumDist, t);
      return { ...s, x, y, isTransfer: transferSet.has(s.nameZhTw) };
    });

    return {
      letter: line.letter,
      color: line.color,
      nameZhTw: line.nameZhTw,
      nameEn: line.nameEn,
      waypoints,
      stations,
    };
  });
}
