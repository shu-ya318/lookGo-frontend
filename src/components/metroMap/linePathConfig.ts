// SVG viewport: 1800 x 1000
// Schematic waypoints for each Taipei MRT line letter.
// Stations are distributed evenly along the polyline based on sequence.

export interface Waypoint {
  x: number;
  y: number;
}

export interface LinePathConfig {
  waypoints: Waypoint[];
}

// Key transfer reference points (approximate schematic intersections):
//   BL ∩ R  → 台北車站  ≈ (880, 520)
//   BL ∩ G  → 忠孝新生  ≈ (1020, 520)
//   R  ∩ O  → 民權西路  ≈ (880, 340)
//   G  ∩ O  → 古亭      ≈ (720, 700)
//   BL ∩ BR → 南港展覽館 ≈ (1700, 520)

export const LINE_PATH_CONFIGS: Record<string, LinePathConfig> = {
  // 板南線：西南→東水平幹線
  BL: {
    waypoints: [
      { x: 80, y: 610 },
      { x: 360, y: 540 },
      { x: 880, y: 520 },
      { x: 1700, y: 520 },
    ],
  },
  // 淡水信義線：南北縱貫
  R: {
    waypoints: [
      { x: 640, y: 60 },
      { x: 880, y: 260 },
      { x: 880, y: 520 },
      { x: 880, y: 900 },
    ],
  },
  // 松山新店線：南北縱貫，略偏R線左側
  G: {
    waypoints: [
      { x: 720, y: 60 },
      { x: 720, y: 340 },
      { x: 720, y: 520 },
      { x: 720, y: 900 },
    ],
  },
  // 中和新蘆線：西北→中心→西南
  O: {
    waypoints: [
      { x: 180, y: 200 },
      { x: 600, y: 340 },
      { x: 880, y: 340 },
      { x: 880, y: 520 },
      { x: 720, y: 700 },
      { x: 380, y: 820 },
    ],
  },
  // 文湖線：西向東高架線，再南折
  BR: {
    waypoints: [
      { x: 280, y: 180 },
      { x: 880, y: 180 },
      { x: 1700, y: 180 },
      { x: 1700, y: 520 },
      { x: 1460, y: 520 },
    ],
  },
};

export function getFallbackConfig(index: number): LinePathConfig {
  const y = 160 + index * 140;
  return { waypoints: [{ x: 80, y }, { x: 1700, y }] };
}
