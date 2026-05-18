"use client";

import { PredictionPoint } from "@/lib/predictionEmballageService";
import { TrendingUp, Package, BarChart3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = { data: PredictionPoint[] };

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / 1000, 1);
      setDisplay(value * (1 - Math.pow(1 - p, 4)));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);
  return <>{display.toFixed(2)}</>;
}

const CARDS = [
  {
    key: "total",
    label: "Total prédit",
    sub: "Cumul sur la période",
    icon: Package,
    accent: "#4338CA",
    light: "#EEF2FF",
    border: "#C7D2FE",
    bar: "#6366F1",
    glow: "rgba(99,102,241,0.15)",
    dot: "#818CF8",
  },
  {
    key: "avg",
    label: "Moyenne / période",
    sub: "Consommation moyenne",
    icon: BarChart3,
    accent: "#0369A1",
    light: "#E0F2FE",
    border: "#7DD3FC",
    bar: "#0EA5E9",
    glow: "rgba(14,165,233,0.15)",
    dot: "#38BDF8",
  },
  {
    key: "max",
    label: "Pic de consommation",
    sub: "Quantité maximale prévue",
    icon: TrendingUp,
    accent: "#B45309",
    light: "#FFFBEB",
    border: "#FCD34D",
    bar: "#F59E0B",
    glow: "rgba(245,158,11,0.15)",
    dot: "#FCD34D",
  },
];

export default function PredictionStats({ data }: Props) {
  const unite = data[0]?.unite || "unités";
  const total = data.reduce((s, d) => s + d.quantite_predite, 0);
  const avg = data.length ? total / data.length : 0;
  const max = data.length ? Math.max(...data.map((d) => d.quantite_predite)) : 0;
  const vals: Record<string, number> = { total, avg, max };

  return (
    <>
      <style>{`
        .pst-wrap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }

        .pst-card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid #E9ECF2;
          border-radius: 18px;
          padding: 22px 22px 20px;
          overflow: hidden;
          cursor: default;
          transition: transform 0.25s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.25s cubic-bezier(.22,1,.36,1),
                      border-color 0.25s;
          box-shadow: 0 2px 8px rgba(15,23,42,0.05);
        }
        .pst-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(15,23,42,0.10), 0 0 0 1px var(--border);
          border-color: var(--border);
        }
        .pst-card::after {
          content: '';
          position: absolute;
          bottom: -24px; right: -24px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: var(--glow);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .pst-card:hover::after { opacity: 1; }
        .pst-card::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 2px;
          background: var(--bar);
          border-radius: 18px 18px 0 0;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .pst-card:hover::before { opacity: 1; }

        .pst-icon-wrap {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: var(--light);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .pst-card:hover .pst-icon-wrap { background: var(--border); }

        .pst-badge {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--accent);
          background: var(--light);
          border: 1px solid var(--border);
          border-radius: 99px;
          padding: 3px 9px;
          font-variant-numeric: tabular-nums;
        }

        .pst-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94A3B8;
          margin: 0 0 5px;
        }

        .pst-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--dot);
          display: inline-block;
          margin-right: 5px;
          vertical-align: middle;
        }

        .pst-value {
          font-size: 30px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.04em;
          line-height: 1;
          margin: 0;
          font-variant-numeric: tabular-nums;
        }

        .pst-unit {
          font-size: 11px;
          font-weight: 400;
          color: #94A3B8;
          margin-left: 5px;
          letter-spacing: 0;
        }

        .pst-sub {
          font-size: 11.5px;
          color: #64748B;
          margin: 9px 0 0;
        }

        .pst-track {
          margin-top: 16px;
          height: 3px;
          background: #F1F5F9;
          border-radius: 99px;
          overflow: hidden;
        }

        .pst-fill {
          height: 100%;
          border-radius: 99px;
          background: var(--bar);
          transition: width 1.1s cubic-bezier(.16,1,.3,1);
        }
      `}</style>

      <div className="pst-wrap">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const val = vals[c.key];
          const pct = max > 0 ? (val / max) * 100 : 0;

          return (
            <div
              key={c.key}
              className="pst-card"
              style={{
                "--accent": c.accent,
                "--light": c.light,
                "--border": c.border,
                "--bar": c.bar,
                "--glow": c.glow,
                "--dot": c.dot,
              } as React.CSSProperties}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div className="pst-icon-wrap">
                  <Icon size={16} style={{ color: c.accent }} strokeWidth={2.2} />
                </div>
                <span className="pst-badge">{pct.toFixed(0)}%</span>
              </div>

              {/* Label */}
              <p className="pst-label">
                <span className="pst-dot" />
                {c.label}
              </p>

              {/* Value */}
              <p className="pst-value">
                {data.length > 0 ? <AnimatedNumber value={val} /> : "—"}
                {data.length > 0 && <span className="pst-unit">{unite}</span>}
              </p>

              {/* Subtitle */}
              <p className="pst-sub">{c.sub}</p>

              {/* Progress bar */}
              <div className="pst-track">
                <div className="pst-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}