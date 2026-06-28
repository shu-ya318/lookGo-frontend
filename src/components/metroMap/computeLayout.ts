import type { MetroMapLine, MetroMapStation } from '@/services/metro/interface';
import {
  LINE_PATH_CONFIGS,
  XINBEITOU_BRANCH_LETTER,
  type Waypoint,
  type LinePathConfig,
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

function mapStations(
  stations: MetroMapStation[],
  config: LinePathConfig,
  transferSet: Set<string>
): PositionedStation[] {
  const { waypoints } = config;
  const tStart = config.tStart ?? 0;
  const tEnd = config.tEnd ?? 1;
  const tRange = tEnd - tStart;
  const cumDist = cumDistances(waypoints);
  const n = stations.length;

  return stations.map((s, i) => {
    const t = n <= 1 ? tEnd : tStart + (i / (n - 1)) * tRange;
    const { x, y } = pointAtT(waypoints, cumDist, t);
    return { ...s, x, y, isTransfer: transferSet.has(s.nameZhTw) };
  });
}

export function computeLayout(lines: MetroMapLine[]): PositionedLine[] {
  const transferSet = buildTransferSet(lines);
  const result: PositionedLine[] = [];

  // Pass 1：R 主線
  const rLine = lines.find((l) => l.letter === 'R');
  if (!rLine) return result;

  // 抽離新北投（R22A），避免干擾主線等比例內插
  const xinbeitouStation = rLine.stations.find(
    (s) => s.stationCode === 'R22A'
  );

  // 降序排列：sequence 最大值（淡水）在前，最小值（象山）在後
  const mainStations = rLine.stations
    .filter((s) => s.stationCode !== 'R22A')
    .sort((a, b) => b.sequence - a.sequence);

  const rConfig = LINE_PATH_CONFIGS['R'];
  const rPositioned = mapStations(mainStations, rConfig, transferSet);

  result.push({
    letter: rLine.letter,
    color: rLine.color,
    nameZhTw: rLine.nameZhTw,
    nameEn: rLine.nameEn,
    waypoints: rConfig.waypoints,
    stations: rPositioned,
  });

  // Pass 2：虛擬支線（新北投）
  const hokutoStation = rPositioned.find((s) => s.stationCode === 'R22');
  if (!xinbeitouStation || !hokutoStation) return result;

  // 支線路徑：從北投實際座標垂直往上延伸 80px
  const branchWaypoints: Waypoint[] = [
    { x: hokutoStation.x, y: hokutoStation.y },
    { x: hokutoStation.x, y: hokutoStation.y - 80 },
  ];
  const branchConfig: LinePathConfig = { waypoints: branchWaypoints };
  const branchPositioned = mapStations(
    [xinbeitouStation],
    branchConfig,
    transferSet
  );

  result.push({
    letter: 'R',
    color: rLine.color,
    nameZhTw: '新北投支線',
    nameEn: 'Xinbeitou Branch',
    waypoints: branchWaypoints,
    stations: branchPositioned,
  });

  return result;
}

export { XINBEITOU_BRANCH_LETTER };
