// SVG viewport: 1000 x 1000
// Schematic waypoints for Taipei MRT lines.
// Stations are distributed proportionally along the polyline based on sequence.

export interface Waypoint {
  x: number;
  y: number;
}

export interface LinePathConfig {
  waypoints: Waypoint[];
  tStart?: number; // 站點分佈的 t 起點（default 0）
  tEnd?: number;   // 站點分佈的 t 終點（default 1）
}

export const XINBEITOU_BRANCH_LETTER = 'R_BRANCH_XINBEITOU';

export const LINE_PATH_CONFIGS: Record<string, LinePathConfig> = {
  // 淡水信義線（sequence 降序 = 淡水→象山）
  // 5 拐點形成嚴格正交骨架；A/E 為虛擬 R 方塊位置，不承載車站
  //
  // 各段長度（總計 1600）：
  //   A→B 垂直  250
  //   B→C 水平  300
  //   C→D 垂直  550
  //   D→E 水平  500
  //
  // tStart = 50/1600 = 0.03 → R28 落在 A 下方約 50px
  // tEnd   = 1550/1600 = 0.97 → R02 落在 E 左側約 50px
  R: {
    waypoints: [
      { x: 150, y: 50 }, // A — 虛擬 R 起點（終點方塊）
      { x: 150, y: 300 }, // B — 第一個 90° 轉彎（垂直段→水平段）
      { x: 450, y: 300 }, // C — 第二個 90° 轉彎（水平段→垂直段）
      { x: 450, y: 850 }, // D — 第三個 90° 轉彎（垂直段→水平段）
      { x: 900, y: 850 }, // E — 虛擬 R 終點（終點方塊）
    ],
    tStart: 0.04,
    tEnd: 0.91058,
  },
  // 新北投支線（虛擬線路）
  // Waypoints 於 runtime 由 computeLayout 覆蓋為北投實際座標
  [XINBEITOU_BRANCH_LETTER]: {
    waypoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  },
};
