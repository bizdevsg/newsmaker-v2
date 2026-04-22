"use client";

import React, {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { Card } from "../../atoms/Card";
import { SectionHeader } from "../../molecules/SectionHeader";

type TechnicalAnalysisIndicatorCardProps = {
  title?: string;
  symbol?: string;
};

type SignalDetail = {
  buy?: number;
  sell?: number;
  neutral?: number;
};

type SignalBlock = {
  label?: string;
  summary?: string;
  detail?: SignalDetail;
  total?: number;
};

type TechnicalAnalysisSignalResponse = {
  oscillatorSummary?: SignalBlock;
  movingAverageSummary?: SignalBlock;
  summary?: SignalBlock;
  errorCode?: string;
  note?: string;
};

const DEFAULT_INTERVAL = "1min";
const REFRESH_INTERVAL_MS = 60_000;
const NEEDLE_ANIMATION_DURATION_MS = 900;
const timeframes = [
  { label: "1M", value: "1min" },
  { label: "5M", value: "5min" },
  { label: "15M", value: "15min" },
  { label: "30M", value: "30min" },
  { label: "60M", value: "60min" },
] as const;

const totalLines = 5; // atau 8 kalau mau
const GAUGE_START_ANGLE = 160;
const GAUGE_END_ANGLE = 20;
const GAUGE_NEUTRAL_ANGLE = (GAUGE_START_ANGLE + GAUGE_END_ANGLE) / 2;
const GAUGE_CENTER_X = 120;
const GAUGE_CENTER_Y = 120;
const NEEDLE_LENGTH = 58;
const NEEDLE_HUB_RADIUS = 6;
const NEEDLE_HUB_STROKE_WIDTH = 2;
const NEEDLE_BASE_RADIUS =
  NEEDLE_HUB_RADIUS + NEEDLE_HUB_STROKE_WIDTH / 2 - 0.5;

const gaugeSeparatorAngles = Array.from({ length: totalLines }, (_, i) => {
  return (
    GAUGE_START_ANGLE -
    (i * (GAUGE_START_ANGLE - GAUGE_END_ANGLE)) / (totalLines - 1)
  );
});

const normalizeSignal = (value: string | undefined) =>
  value?.replace(/\s+/g, " ").trim().toUpperCase() ?? "NEUTRAL";

const formatSignal = (value: string | undefined, fallback = "No Data") => {
  if (!value?.trim()) return fallback;

  const normalized = normalizeSignal(value);
  return normalized
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getSignalScore = (
  summaryValue: string | undefined,
  detail: SignalDetail | undefined,
  total: number,
) => {
  const normalized = normalizeSignal(summaryValue);
  const buy = Number(detail?.buy ?? 0);
  const sell = Number(detail?.sell ?? 0);
  const neutral = Number(detail?.neutral ?? 0);

  if (total <= 0) {
    if (normalized === "STRONG SELL") return 10;
    if (normalized === "SELL") return 30;
    if (normalized === "BUY") return 70;
    if (normalized === "STRONG BUY") return 90;
    return 50;
  }

  const buyShare = buy / total;
  const sellShare = sell / total;
  const neutralShare = neutral / total;

  if (normalized === "STRONG SELL") {
    return Math.round(Math.max(0, Math.min(18, 6 + sellShare * 12)));
  }

  if (normalized === "SELL") {
    return Math.round(Math.max(20, Math.min(40, 22 + sellShare * 12)));
  }

  if (normalized === "BUY") {
    return Math.round(Math.max(60, Math.min(80, 66 + buyShare * 10)));
  }

  if (normalized === "STRONG BUY") {
    return Math.round(
      Math.max(82, Math.min(98, 82 + buyShare * 12 + neutralShare * 4)),
    );
  }

  return Math.round(
    Math.max(
      40,
      Math.min(60, 50 + (buyShare - sellShare) * 8 - neutralShare * 2),
    ),
  );
};

const getSignalToneClass = (value: string | undefined) => {
  const normalized = normalizeSignal(value);

  if (normalized === "STRONG BUY") return "text-[#0d61fc]";
  if (normalized === "BUY") return "text-[#455bff]";
  if (normalized === "STRONG SELL") return "text-rose-700";
  if (normalized === "SELL") return "text-rose-600";

  return "text-slate-500";
};

const detailValue = (value: number | undefined) => String(value ?? 0);
const getGaugeAngle = (score: number) =>
  GAUGE_START_ANGLE -
  (Math.max(0, Math.min(100, score)) / 100) *
    (GAUGE_START_ANGLE - GAUGE_END_ANGLE);

const easeOutBack = (progress: number) => {
  const overshoot = 1.70158;
  const adjusted = progress - 1;

  return 1 + (overshoot + 1) * adjusted ** 3 + overshoot * adjusted ** 2;
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
) => {
  const radians = (Math.PI / 180) * angle;

  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY - radius * Math.sin(radians),
  };
};

async function fetchTechnicalAnalysisSignal(
  symbol: string,
  interval: string,
  signal?: AbortSignal,
): Promise<TechnicalAnalysisSignalResponse | null> {
  const params = new URLSearchParams({
    symbol,
    interval,
  });

  try {
    const response = await fetch(`/api/newsmaker-v2/signal?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) return null;

    return (await response
      .json()
      .catch(() => null)) as TechnicalAnalysisSignalResponse | null;
  } catch {
    return null;
  }
}

export function TechnicalAnalysisIndicatorCard({
  title = "Technical Analysis Indicator",
  symbol = "XAU/USD",
}: TechnicalAnalysisIndicatorCardProps) {
  const [selectedInterval, setSelectedInterval] = useState(DEFAULT_INTERVAL);
  const [signalData, setSignalData] =
    useState<TechnicalAnalysisSignalResponse | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animatedNeedleAngle, setAnimatedNeedleAngle] =
    useState(GAUGE_NEUTRAL_ANGLE);
  const needleAngleRef = useRef(GAUGE_NEUTRAL_ANGLE);

  const refreshSignal = useEffectEvent(async (signal?: AbortSignal) => {
    setIsRefreshing(true);
    const nextSignalData = await fetchTechnicalAnalysisSignal(
      symbol,
      selectedInterval,
      signal,
    );

    if (signal?.aborted) return;

    startTransition(() => {
      if (nextSignalData) {
        setSignalData(nextSignalData);
      }
      setIsLoaded(true);
      setIsRefreshing(false);
    });
  });

  useEffect(() => {
    let activeRequest: AbortController | null = null;

    const runRefresh = () => {
      activeRequest?.abort();
      activeRequest = new AbortController();
      void refreshSignal(activeRequest.signal);
    };

    runRefresh();
    const intervalId = window.setInterval(runRefresh, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      activeRequest?.abort();
    };
  }, [selectedInterval, symbol]);

  const summary = signalData?.summary;
  const summaryTotal = Number(summary?.total ?? 0);
  const signalScore = getSignalScore(
    summary?.summary,
    summary?.detail,
    summaryTotal,
  );
  const needleAngle = getGaugeAngle(signalScore);
  const needleTip = polarToCartesian(
    GAUGE_CENTER_X,
    GAUGE_CENTER_Y,
    NEEDLE_LENGTH,
    animatedNeedleAngle,
  );
  const needleBase = polarToCartesian(
    GAUGE_CENTER_X,
    GAUGE_CENTER_Y,
    NEEDLE_BASE_RADIUS,
    animatedNeedleAngle,
  );
  const signalLabel = formatSignal(
    summary?.summary,
    isLoaded ? "No Data" : "Loading",
  );
  const signalTone =
    summary?.label?.trim() || (isLoaded ? "Summary" : "Updating");
  const signalToneClass = getSignalToneClass(summary?.summary);
  const errorCode = signalData?.errorCode?.trim();
  const errorNote = signalData?.note?.trim();
  const detailCards = [
    {
      label: "Sell",
      value: detailValue(summary?.detail?.sell),
      className: "text-rose-600",
    },
    {
      label: "Neutral",
      value: detailValue(summary?.detail?.neutral),
      className: "text-slate-500",
    },
    {
      label: "Buy",
      value: detailValue(summary?.detail?.buy),
      className: "text-[#0d61fc]",
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startAngle = needleAngleRef.current;
    const angleDelta = needleAngle - startAngle;
    const startTime = performance.now();
    const duration = prefersReducedMotion ? 0 : NEEDLE_ANIMATION_DURATION_MS;
    let frameId = 0;

    const animate = (now: number) => {
      const progress =
        duration === 0 ? 1 : Math.min(1, (now - startTime) / duration);
      const easedProgress = duration === 0 ? 1 : easeOutBack(progress);
      const nextAngle = startAngle + angleDelta * easedProgress;

      needleAngleRef.current = nextAngle;
      setAnimatedNeedleAngle(nextAngle);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [needleAngle]);

  return (
    <Card className="h-fit">
      <SectionHeader
        title={title}
        linkLabel="More..."
        link="https://newsmaker.id/index.php/en/"
      />
      <div className="p-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex justify-center gap-2">
            {timeframes.map((timeframe) => {
              return (
                <button
                  type="button"
                  key={timeframe.value}
                  onClick={() => setSelectedInterval(timeframe.value)}
                  className={`w-full items-center rounded-full px-3 py-1 text-xs font-semibold transition ${
                    timeframe.value === selectedInterval
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  aria-pressed={timeframe.value === selectedInterval}
                >
                  <p className="text-center">{timeframe.label}</p>
                </button>
              );
            })}
          </div>

          {errorCode === "SIGNAL_SOURCE_METHOD_DIFFERENCE" ? (
            <div>
              <div className="mt-2 w-full flex items-center justify-center">
                <div className="relative h-44 w-60 max-w-full">
                  <svg
                    viewBox="0 0 240 160"
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="technical-indicator-gauge"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#f50a21" />
                        <stop offset="25%" stopColor="#ffabb3" />
                        <stop offset="75%" stopColor="#455bff" />
                        <stop offset="100%" stopColor="#0d61fc" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke="url(#technical-indicator-gauge)"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke="rgba(255,255,255,0.95)"
                      strokeWidth="2"
                    />
                    {gaugeSeparatorAngles.map((angle) => {
                      const outerPoint = polarToCartesian(120, 120, 99, angle);
                      const innerPoint = polarToCartesian(120, 120, 85, angle);

                      return (
                        <line
                          key={angle}
                          x1={outerPoint.x}
                          y1={outerPoint.y}
                          x2={innerPoint.x}
                          y2={innerPoint.y}
                          stroke="rgba(255,255,255,0.96)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      );
                    })}
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke="rgba(148,163,184,0.22)"
                      strokeWidth="10"
                      strokeDasharray="1 15"
                    />
                    <line
                      x1={needleBase.x + 1.5}
                      y1={needleBase.y + 1.5}
                      x2={needleTip.x + 1.5}
                      y2={needleTip.y + 1.5}
                      stroke="rgba(15,23,42,0.12)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line
                      x1={needleBase.x}
                      y1={needleBase.y}
                      x2={needleTip.x}
                      y2={needleTip.y}
                      stroke="#0f172a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={GAUGE_CENTER_X}
                      cy={GAUGE_CENTER_Y}
                      r={NEEDLE_HUB_RADIUS}
                      fill="#0f172a"
                      stroke="#ffffff"
                      strokeWidth={NEEDLE_HUB_STROKE_WIDTH}
                    />
                  </svg>

                  <div className="absolute left-[-7%] top-[45%] text-center text-[10px] font-semibold text-rose-600 md:text-xs">
                    Strong
                    <br />
                    Sell
                  </div>
                  <div className="absolute left-[15%] top-[20%] text-[10px] font-semibold text-rose-500 md:text-xs">
                    Sell
                  </div>
                  <div className="absolute left-1/2 top-[5%] -translate-x-1/2 text-[10px] font-semibold text-slate-700 md:text-xs">
                    Neutral
                  </div>
                  <div className="absolute right-[15%] top-[20%] text-[10px] font-semibold text-[#455bff] md:text-xs">
                    Buy
                  </div>
                  <div className="absolute right-[-7%] top-[45%] text-center text-[10px] font-semibold text-[#0d61fc] md:text-xs">
                    Strong
                    <br />
                    Buy
                  </div>

                  <div className="absolute inset-x-0 top-[84%] text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em]">
                        {signalTone}
                      </p>
                      <span>-</span>
                      <p className="text-[10px] font-medium">
                        {symbol}
                        {isRefreshing ? " • Updating..." : ""}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold leading-none tracking-[-0.04em] ${signalToneClass}`}
                    >
                      {signalLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-center">
                {detailCards.map((card) => (
                  <div
                    key={card.label}
                    className={`px-1 py-2 ${card.label !== "Buy" ? "border-r border-slate-200" : ""}`}
                  >
                    <p className="text-[11px] font-semibold text-slate-500">
                      {card.label}
                    </p>
                    <p
                      className={`mt-2 text-xl font-bold leading-none tracking-[-0.04em] ${card.className}`}
                    >
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="mx-auto mb-3 rounded-full bg-red-100 border border-red-300 shadow h-15 w-15 flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-3xl text-red-800"></i>
              </div>
              <p className="text-sm text-center text-wrap font-medium text-red-500">
                {errorCode}
              </p>
              <div className="bg-neutral-200 rounded-md mt-2 py-2 px-3">
                <p className="text-sm text-center">{errorNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
