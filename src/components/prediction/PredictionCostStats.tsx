"use client";

import { PredictionPoint } from "@/lib/predictionEmballageService";
import { Wallet, TrendingUp, Flame, Calculator } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  data: PredictionPoint[];
};

function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
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
  return <>{display.toFixed(decimals)}</>;
}

export default function PredictionCostStats({ data }: Props) {
  const totalCost = data.reduce((sum, item) => sum + Number(item.cout_predite || 0), 0);
  const avgCost = data.length ? totalCost / data.length : 0;
  const maxCost = data.length
    ? Math.max(...data.map((item) => Number(item.cout_predite || 0)))
    : 0;
  const maxCostPeriod = data.find(
    (item) => Number(item.cout_predite || 0) === maxCost
  );

  const CARDS = [
    {
      title: "Coût total prévisionnel",
      value: totalCost,
      subtitle: "Budget total estimé",
      icon: Wallet,
      accent: "#059669",
      light: "#ECFDF5",
      border: "#6EE7B7",
      bar: "#10B981",
      glow: "rgba(16,185,129,0.12)",
      dot: "#34D399",
      isCurrency: true,
    },
    {
      title: "Coût moyen",
      value: avgCost,
      subtitle: "Moyenne par période",
      icon: Calculator,
      accent: "#0284C7",
      light: "#E0F2FE",
      border: "#7DD3FC",
      bar: "#0EA5E9",
      glow: "rgba(14,165,233,0.12)",
      dot: "#38BDF8",
      isCurrency: true,
    },
    {
      title: "Pic budgétaire",
      value: maxCost,
      subtitle: maxCostPeriod?.periode || "Aucune période",
      icon: Flame,
      accent: "#DC2626",
      light: "#FEF2F2",
      border: "#FCA5A5",
      bar: "#EF4444",
      glow: "rgba(239,68,68,0.12)",
      dot: "#F87171",
      isCurrency: true,
    },
    {
      title: "Analyse financière",
      value: data.length,
      subtitle: "Périodes analysées",
      icon: TrendingUp,
      accent: "#7C3AED",
      light: "#F5F3FF",
      border: "#C4B5FD",
      bar: "#8B5CF6",
      glow: "rgba(139,92,246,0.12)",
      dot: "#A78BFA",
      isCurrency: false,
    },
  ];

  const maxVal = Math.max(...CARDS.map((c) => c.value));

  return (
    <>
      <style>{`
        .pcs-wrap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }

        .pcs-card {
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

        .pcs-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(15,23,42,0.10), 0 0 0 1px var(--border);
          border-color: var(--border);
        }

        .pcs-card::after {
          content: '';
          position: absolute;
          bottom: -28px;
          right: -28px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: var(--glow);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .pcs-card:hover::after { opacity: 1; }

        .pcs-card::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 2px;
          background: var(--bar);
          border-radius: 18px 18px 0 0;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .pcs-card:hover::before { opacity: 1; }

        .pcs-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--light);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .pcs-card:hover .pcs-icon-wrap { background: var(--border); }

        .pcs-badge {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--accent);
          background: var(--light);
          border: 1px solid var(--border);
          border-radius: 99px;
          padding: 3px 9px;
          font-variant-numeric: tabular-nums;
        }

        .pcs-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94A3B8;
          margin: 0 0 5px;
        }

        .pcs-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--dot);
          display: inline-block;
          margin-right: 5px;
          vertical-align: middle;
          box-shadow: 0 0 0 2px var(--light);
        }

        .pcs-value {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.04em;
          line-height: 1;
          margin: 0;
          font-variant-numeric: tabular-nums;
        }

        .pcs-currency {
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
          margin-left: 3px;
          letter-spacing: 0;
          vertical-align: super;
          font-variant-numeric: tabular-nums;
        }

        .pcs-count {
          font-size: 36px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.05em;
          line-height: 1;
        }

        .pcs-sub {
          font-size: 11.5px;
          color: #64748B;
          margin: 9px 0 0;
          font-weight: 400;
        }

        .pcs-track {
          margin-top: 16px;
          height: 3px;
          background: #F1F5F9;
          border-radius: 99px;
          overflow: hidden;
        }

        .pcs-fill {
          height: 100%;
          border-radius: 99px;
          background: var(--bar);
          transition: width 1.1s cubic-bezier(.16,1,.3,1);
        }
      `}</style>

      <div className="pcs-wrap">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const pct = maxVal > 0 ? (card.value / maxVal) * 100 : 0;

          return (
            <div
              key={card.title}
              className="pcs-card"
              style={{
                "--accent": card.accent,
                "--light": card.light,
                "--border": card.border,
                "--bar": card.bar,
                "--glow": card.glow,
                "--dot": card.dot,
              } as React.CSSProperties}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div className="pcs-icon-wrap">
                  <Icon size={16} style={{ color: card.accent }} strokeWidth={2.2} />
                </div>
                <span className="pcs-badge">{pct.toFixed(0)}%</span>
              </div>

              {/* Label */}
              <p className="pcs-label">
                <span className="pcs-dot" />
                {card.title}
              </p>

              {/* Value */}
              {card.isCurrency ? (
                <p className="pcs-value">
                  {data.length > 0 ? <AnimatedNumber value={card.value} /> : "—"}
                  {data.length > 0 && <span className="pcs-currency">DT</span>}
                </p>
              ) : (
                <p className="pcs-count">
                  {data.length > 0 ? card.value : "—"}
                </p>
              )}

              {/* Subtitle */}
              <p className="pcs-sub">{card.subtitle}</p>

              {/* Progress bar */}
              <div className="pcs-track">
                <div className="pcs-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}