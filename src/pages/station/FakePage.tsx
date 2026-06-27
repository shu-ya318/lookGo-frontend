/**
 * NetworkMapPage.tsx
 *
 * 測試用：只畫板南線 BL01–BL23，用固定座標（非 force simulation）
 * 對應真實路網圖的水平走向，搭配 D3 做：
 *   - 線段 (path)
 *   - 圓形站點 (circle)
 *   - 站名標籤（上下交錯避免重疊）
 *   - zoom / pan
 *   - hover tooltip
 *   - 入場動畫（線段從左到右 draw-on）
 */

import { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { line, curveCatmullRom } from "d3-shape";
import { easeCubicInOut, easeBackOut } from "d3-ease";
// Resolve: Property 'transition' does not exist on type 'Selection<SVGPathElement, unknown, null, undefined>
import { transition } from "d3-transition";
select.prototype.transition = transition;

const d3 = {
  select,
  zoom,
  line,
  curveCatmullRom,
  easeCubicInOut,
  easeBackOut,
} as const;

interface BLStation {
  id: string; // "BL01" … "BL23"
  code: string; // 顯示用編號
  name: string; // 中文
  nameEn: string; // 英文
  x: number; // SVG 固定 x 座標
  y: number; // SVG 固定 y 座標（主要水平，轉折點才不同）
  isTransfer: boolean;
}

const BL_COLOR = "#0070BD";
const SVG_W = 1400;
const SVG_H = 500;

// 計算 x：23 站平均分布在 80–1320 之間
const X_START = 80;
const X_END = 1320;
const STEP = (X_END - X_START) / 22; // 22 段

// 對應圖片，板橋(BL07)之前路線稍微在下方，之後水平往右
// 用 y 座標模擬這段轉折
function stationY(index: number): number {
  // index 0=BL01(頂埔) … 6=BL07(板橋) … 22=BL23(南港展覽館)
  if (index <= 6) return 340; // 頂埔→板橋：偏下
  if (index === 7) return 320; // 新埔：斜坡
  if (index === 8) return 300; // 江子翠：接回水平
  return 300; // 龍山寺→南港展覽館：水平
}

const BL_STATIONS: BLStation[] = [
  {
    id: "BL01",
    code: "BL01",
    name: "頂埔",
    nameEn: "Dingpu",
    isTransfer: false,
  },
  {
    id: "BL02",
    code: "BL02",
    name: "永寧",
    nameEn: "Yongning",
    isTransfer: false,
  },
  {
    id: "BL03",
    code: "BL03",
    name: "土城",
    nameEn: "Tucheng",
    isTransfer: false,
  },
  {
    id: "BL04",
    code: "BL04",
    name: "海山",
    nameEn: "Haishan",
    isTransfer: false,
  },
  {
    id: "BL05",
    code: "BL05",
    name: "亞東醫院",
    nameEn: "Far Eastern Hospital",
    isTransfer: false,
  },
  {
    id: "BL06",
    code: "BL06",
    name: "府中",
    nameEn: "Fuzhong",
    isTransfer: false,
  },
  {
    id: "BL07",
    code: "BL07",
    name: "板橋",
    nameEn: "Banqiao",
    isTransfer: true,
  },
  {
    id: "BL08",
    code: "BL08",
    name: "新埔",
    nameEn: "Xinpu",
    isTransfer: false,
  },
  {
    id: "BL09",
    code: "BL09",
    name: "江子翠",
    nameEn: "Jiangzicui",
    isTransfer: false,
  },
  {
    id: "BL10",
    code: "BL10",
    name: "龍山寺",
    nameEn: "Longshan Temple",
    isTransfer: false,
  },
  { id: "BL11", code: "BL11", name: "西門", nameEn: "Ximen", isTransfer: true },
  {
    id: "BL12",
    code: "BL12",
    name: "台北車站",
    nameEn: "Taipei Main Station",
    isTransfer: true,
  },
  {
    id: "BL13",
    code: "BL13",
    name: "善導寺",
    nameEn: "Shandao Temple",
    isTransfer: false,
  },
  {
    id: "BL14",
    code: "BL14",
    name: "忠孝新生",
    nameEn: "Zhongxiao Xinsheng",
    isTransfer: true,
  },
  {
    id: "BL15",
    code: "BL15",
    name: "忠孝復興",
    nameEn: "Zhongxiao Fuxing",
    isTransfer: true,
  },
  {
    id: "BL16",
    code: "BL16",
    name: "忠孝敦化",
    nameEn: "Zhongxiao Dunhua",
    isTransfer: false,
  },
  {
    id: "BL17",
    code: "BL17",
    name: "國父紀念館",
    nameEn: "Sun Yat-sen Memorial Hall",
    isTransfer: false,
  },
  {
    id: "BL18",
    code: "BL18",
    name: "市政府",
    nameEn: "Taipei City Hall",
    isTransfer: false,
  },
  {
    id: "BL19",
    code: "BL19",
    name: "永春",
    nameEn: "Yongchun",
    isTransfer: false,
  },
  {
    id: "BL20",
    code: "BL20",
    name: "後山埤",
    nameEn: "Houshanpi",
    isTransfer: false,
  },
  {
    id: "BL21",
    code: "BL21",
    name: "昆陽",
    nameEn: "Kunyang",
    isTransfer: false,
  },
  {
    id: "BL22",
    code: "BL22",
    name: "南港",
    nameEn: "Nangang",
    isTransfer: true,
  },
  {
    id: "BL23",
    code: "BL23",
    name: "南港展覽館",
    nameEn: "Nangang Exhibition Center",
    isTransfer: false,
  },
].map((s, i) => ({
  ...s,
  x: X_START + i * STEP,
  y: stationY(i),
}));

// ─────────────────────────────────────────────
// 3. D3 繪製參數
// ─────────────────────────────────────────────
const NODE_R_NORMAL = 9;
const NODE_R_TRANSFER = 13;
const LINE_WIDTH = 8;
const FONT_ZH = 12;
const FONT_EN = 10;
const LABEL_OFFSET = 26; // 站名離圓心距離

// ─────────────────────────────────────────────
// 4. 元件
// ─────────────────────────────────────────────
export default function FakeNetworkMapPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    station: BLStation;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // ── zoom / pan 容器 ──────────────────────
    const root = svg.append("g").attr("class", "root");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 4])
        .on("zoom", (e) => root.attr("transform", e.transform))
    );

    // ── 建立路徑資料（依序連接所有站點）──────
    const lineGenerator = d3
      .line<BLStation>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCatmullRom.alpha(0.5)); // 轉折處微微平滑

    const pathData = lineGenerator(BL_STATIONS)!;

    // ── ① 畫路線（粗線）────────────────────
    const linePath = root
      .append("path")
      .attr("d", pathData)
      .attr("fill", "none")
      .attr("stroke", BL_COLOR)
      .attr("stroke-width", LINE_WIDTH)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

    // 入場動畫：stroke-dashoffset 從全長→0
    const totalLength = (linePath.node() as SVGPathElement).getTotalLength();
    linePath
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1800)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    // ── ② 畫站點圓圈 ─────────────────────────
    const stationG = root.append("g").attr("class", "stations");

    const circles = stationG
      .selectAll<SVGCircleElement, BLStation>("circle")
      .data(BL_STATIONS)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 0) // 初始 r=0，動畫展開
      .attr("fill", (d) => (d.isTransfer ? "#ffffff" : BL_COLOR))
      .attr("stroke", BL_COLOR)
      .attr("stroke-width", (d) => (d.isTransfer ? 3.5 : 2))
      .attr("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(120)
          .attr("r", (d.isTransfer ? NODE_R_TRANSFER : NODE_R_NORMAL) * 1.4);
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          station: d,
        });
      })
      .on("mousemove", function (event) {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip((prev) =>
          prev
            ? {
              ...prev,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            }
            : null
        );
      })
      .on("mouseleave", function (_, d) {
        d3.select(this)
          .transition()
          .duration(120)
          .attr("r", d.isTransfer ? NODE_R_TRANSFER : NODE_R_NORMAL);
        setTooltip(null);
      });

    // 圓圈入場動畫（延遲接在線段後）
    circles
      .transition()
      .delay((_, i) => 1800 + i * 40)
      .duration(300)
      .ease(d3.easeBackOut)
      .attr("r", (d) => (d.isTransfer ? NODE_R_TRANSFER : NODE_R_NORMAL));

    // ── ③ 站名標籤（上下交錯）───────────────
    const labelG = root.append("g").attr("class", "labels");

    BL_STATIONS.forEach((s, i) => {
      // 偶數站：標籤在上；奇數站：標籤在下
      const isAbove = i % 2 === 0;
      const dir = isAbove ? -1 : 1;
      const baseY = s.y + dir * LABEL_OFFSET;

      const g = labelG
        .append("g")
        .attr("opacity", 0)
        .attr("pointer-events", "none");

      // 站碼 badge（小矩形）
      const badgeW = 36,
        badgeH = 16,
        badgeR = 4;
      g.append("rect")
        .attr("x", s.x - badgeW / 2)
        .attr("y", baseY + (isAbove ? -badgeH - 2 : 2))
        .attr("width", badgeW)
        .attr("height", badgeH)
        .attr("rx", badgeR)
        .attr("fill", BL_COLOR);

      g.append("text")
        .attr("x", s.x)
        .attr("y", baseY + (isAbove ? -badgeH / 2 - 2 + 4 : 2 + badgeH / 2 + 4))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#fff")
        .attr("font-size", 9)
        .attr("font-family", "monospace")
        .attr("font-weight", "700")
        .text(s.code);

      // 中文站名
      const zhY = isAbove ? baseY - badgeH - 6 : baseY + badgeH + 16;
      g.append("text")
        .attr("x", s.x)
        .attr("y", zhY)
        .attr("text-anchor", "middle")
        .attr("fill", "#1a1a2e")
        .attr("font-size", FONT_ZH)
        .attr("font-weight", s.isTransfer ? "700" : "400")
        .attr("font-family", 'system-ui, "PingFang TC", sans-serif')
        .text(s.name);

      // 英文站名
      g.append("text")
        .attr("x", s.x)
        .attr("y", zhY + (isAbove ? -14 : 14))
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .attr("font-size", FONT_EN)
        .attr("font-family", "system-ui, Arial, sans-serif")
        .text(s.nameEn);

      // 標籤入場動畫
      g.transition()
        .delay(1800 + i * 40 + 200)
        .duration(250)
        .attr("opacity", 1);
    });

    // ── ④ 兩端終點站標誌（藍色方塊）─────────
    [BL_STATIONS[0], BL_STATIONS[BL_STATIONS.length - 1]].forEach((s) => {
      root
        .append("rect")
        .attr("x", s.x - 18)
        .attr("y", s.y - 18)
        .attr("width", 36)
        .attr("height", 36)
        .attr("rx", 6)
        .attr("fill", BL_COLOR)
        .attr("opacity", 0)
        .transition()
        .delay(2400)
        .duration(400)
        .attr("opacity", 1);

      root
        .append("text")
        .attr("x", s.x)
        .attr("y", s.y + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#fff")
        .attr("font-size", 11)
        .attr("font-weight", "800")
        .attr("font-family", "monospace")
        .attr("opacity", 0)
        .text("BL")
        .transition()
        .delay(2400)
        .duration(400)
        .attr("opacity", 1);
    });
  }, []); // 只跑一次

  return (
    <div
      style={{
        background: "#f0f4f8",
        minHeight: "100vh",
        padding: "32px 24px",
        fontFamily: 'system-ui, "PingFang TC", sans-serif',
      }}
    >
      {/* 標題 */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: "#1a1a2e",
            letterSpacing: 1,
          }}
        >
          捷運路網圖
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
          板南線 BL｜Bannan Line — 頂埔 ↔ 南港展覽館（BL01–BL23）
        </p>
      </div>

      {/* 操作提示 */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          fontSize: 12,
          color: "#888",
        }}
      >
        <span>🖱 捲動縮放</span>
        <span>✋ 拖曳平移</span>
        <span>● 白底圓 = 轉乘站</span>
        <span>● 藍底圓 = 一般站</span>
      </div>

      {/* SVG 畫布 */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 4px 32px rgba(0,112,189,0.10)",
          overflow: "hidden",
          position: "relative",
          display: "inline-block",
          width: "100%",
        }}
      >
        <svg
          ref={svgRef}
          width='100%'
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: "block", minHeight: 300 }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y - 72,
              transform: "translateX(-50%)",
              background: "#1a1a2e",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              pointerEvents: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {tooltip.station.name}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
              {tooltip.station.nameEn}
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 6,
                background: BL_COLOR,
                color: "#fff",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              {tooltip.station.code}
              {tooltip.station.isTransfer && (
                <span
                  style={{
                    marginLeft: 6,
                    background: "#f59e0b",
                    borderRadius: 3,
                    padding: "1px 5px",
                  }}
                >
                  轉乘
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 圖例 */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 16,
          fontSize: 12,
          color: "#555",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={24} height={24}>
            <circle
              cx={12}
              cy={12}
              r={8}
              fill={BL_COLOR}
              stroke={BL_COLOR}
              strokeWidth={2}
            />
          </svg>
          一般站
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={24} height={24}>
            <circle
              cx={12}
              cy={12}
              r={9}
              fill='#fff'
              stroke={BL_COLOR}
              strokeWidth={3}
            />
          </svg>
          轉乘站
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={24} height={24}>
            <rect x={2} y={4} width={20} height={16} rx={4} fill={BL_COLOR} />
            <text
              x={12}
              y={13}
              textAnchor='middle'
              dominantBaseline='middle'
              fill='#fff'
              fontSize={8}
              fontWeight='800'
              fontFamily='monospace'
            >
              BL
            </text>
          </svg>
          終點站
        </div>
      </div>
    </div>
  );
}
