"use client";

import { useEffect, useState } from "react";
import {useAIPrediction} from "@/components/IApredection/hook";
import { listEmballages } from "@/lib/emballages.api";
import { fetchEntrepots } from "@/lib/entrepot.api";
import type { Emballages } from "@/types/emballage";
import type { Entrepot } from "@/lib/entrepot.api";
import type { DashboardFilters } from "@/types/prediction.types";

const MOIS_OPTIONS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

const currentYear = new Date().getFullYear();
const ANNEES = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

export default function PredictionPage() {
  const now = new Date();

  const [filters, setFilters] = useState<DashboardFilters>({
    annee: now.getFullYear(),
    mois: now.getMonth() + 1,
    emballage_id: null,
    entrepot_id: null,
  });

  const [emballages, setEmballages] = useState<Emballages[]>([]);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const { result, historique, isLoading, error, runPrediction, reset } =
    useAIPrediction();

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingLists(true);
        setListError(null);

        const emballageResp = await listEmballages(1, 100);
        const entrepotResp = await fetchEntrepots();

        setEmballages(emballageResp.emballages.data);
        setEntrepots(entrepotResp);
      } catch (err) {
        console.error(err);
        setListError("Impossible de charger les emballages ou les entrepôts.");
      } finally {
        setLoadingLists(false);
      }
    }

    loadData();
  }, []);

  const handleChange = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    reset();
  };

  const selectedEmballage = emballages.find(
    (e) => String(e.id) === filters.emballage_id
  );

  const selectedEntrepot = entrepots.find(
    (e) => String(e.id) === filters.entrepot_id
  );

  const canPredict =
    !!filters.emballage_id && !!filters.entrepot_id && !isLoading;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background:
          "linear-gradient(135deg, #E0F7FA 0%, #ECFDF5 45%, #FFF7CC 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "26px",
          padding: "1.8rem",
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
          border: "1px solid rgba(255,255,255,0.75)",
        }}
      >
        <header style={{ marginBottom: "1.8rem" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #38BDF8, #10B981)",
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Intelligence Artificielle
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#0F172A",
              fontWeight: 700,
            }}
          >
            Dashboard IA — Prédiction des besoins en emballages
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#475569",
              fontSize: "15px",
            }}
          >
            Sélectionnez une période, un emballage et un entrepôt pour estimer
            la quantité nécessaire.
          </p>
        </header>

        <section
          style={{
            padding: "1.3rem",
            borderRadius: "22px",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
            border: "1px solid #E2E8F0",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#0F766E",
              marginBottom: "1rem",
            }}
          >
            Paramètres de prédiction
          </h2>

          {listError && (
            <div style={{ color: "#DC2626", marginBottom: "1rem" }}>
              {listError}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <Field label="Année">
              <select
                value={filters.annee}
                onChange={(e) =>
                  handleChange("annee", Number(e.target.value))
                }
                style={selectStyle}
              >
                {ANNEES.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Mois à prédire">
              <select
                value={filters.mois}
                onChange={(e) => handleChange("mois", Number(e.target.value))}
                style={selectStyle}
              >
                {MOIS_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Emballage">
              <select
                value={filters.emballage_id ?? ""}
                onChange={(e) =>
                  handleChange("emballage_id", e.target.value || null)
                }
                style={selectStyle}
                disabled={loadingLists}
              >
                <option value="">Choisir un emballage</option>
                {emballages.map((emb) => (
                  <option key={emb.id} value={String(emb.id)}>
                    {emb.code} — {emb.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Entrepôt">
              <select
                value={filters.entrepot_id ?? ""}
                onChange={(e) =>
                  handleChange("entrepot_id", e.target.value || null)
                }
                style={selectStyle}
                disabled={loadingLists}
              >
                <option value="">Choisir un entrepôt</option>
                {entrepots.map((ent) => (
                  <option key={ent.id} value={String(ent.id)}>
                    {ent.nom}
                  </option>
                ))}
              </select>
            </Field>

            <button
              onClick={() => runPrediction(filters)}
              disabled={!canPredict}
              style={{
                height: "44px",
                border: "none",
                borderRadius: "14px",
                color: "white",
                fontWeight: 700,
                cursor: canPredict ? "pointer" : "not-allowed",
                background: canPredict
                  ? "linear-gradient(90deg, #38BDF8, #10B981)"
                  : "#94A3B8",
                boxShadow: canPredict
                  ? "0 12px 25px rgba(16, 185, 129, 0.28)"
                  : "none",
              }}
            >
              {isLoading ? "Calcul..." : "Lancer la prédiction ↗"}
            </button>
          </div>

          {(selectedEmballage || selectedEntrepot) && (
            <div
              style={{
                marginTop: "1.2rem",
                padding: "1rem",
                borderRadius: "18px",
                background: "#F0FDFA",
                border: "1px solid #CCFBF1",
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                color: "#334155",
                fontSize: "13px",
              }}
            >
              {selectedEmballage && (
                <>
                  <span>
                    <strong>Type :</strong> {selectedEmballage.type}
                  </span>
                  <span>
                    <strong>Capacité :</strong>{" "}
                    {selectedEmballage.capacity_value}{" "}
                    {selectedEmballage.capacity_unit}
                  </span>
                  <span>
                    <strong>Matière :</strong> {selectedEmballage.material}
                  </span>
                  <span>
                    <strong>Stock min :</strong> {selectedEmballage.min_stock}
                  </span>
                </>
              )}

              {selectedEntrepot && (
                <>
                  <span>
                    <strong>Entrepôt :</strong> {selectedEntrepot.nom}
                  </span>
                  <span>
                    <strong>Adresse :</strong> {selectedEntrepot.adresse}
                  </span>
                  <span>
                    <strong>Stock actuel :</strong>{" "}
                    {selectedEntrepot.stock_existant?.toLocaleString("fr-FR")}
                  </span>
                </>
              )}
            </div>
          )}
        </section>

        {error && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "16px",
              background: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <section>
            <div
              style={{
                padding: "1.2rem",
                borderRadius: "22px",
                background:
                  result.statut === "hausse"
                    ? "linear-gradient(135deg, #FFF7CC, #FFFFFF)"
                    : result.statut === "baisse"
                    ? "linear-gradient(135deg, #E0F2FE, #FFFFFF)"
                    : "linear-gradient(135deg, #DCFCE7, #FFFFFF)",
                border: "1px solid #E2E8F0",
                marginBottom: "1.2rem",
              }}
            >
              <h2 style={{ margin: 0, color: "#0F172A", fontSize: "18px" }}>
                {result.emballage_name} · {result.entrepot_nom}
              </h2>
              <p style={{ marginTop: "6px", color: "#475569" }}>
                Période à prédire :{" "}
                <strong>
                  {
                    MOIS_OPTIONS.find((m) => m.value === result.mois)?.label
                  }{" "}
                  {result.annee}
                </strong>
              </p>

              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color:
                    result.statut === "hausse"
                      ? "#92400E"
                      : result.statut === "baisse"
                      ? "#0369A1"
                      : "#047857",
                  background:
                    result.statut === "hausse"
                      ? "#FEF3C7"
                      : result.statut === "baisse"
                      ? "#E0F2FE"
                      : "#D1FAE5",
                }}
              >
                {result.statut === "hausse"
                  ? "↑ Hausse prévue"
                  : result.statut === "baisse"
                  ? "↓ Baisse prévue"
                  : "→ Stable"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <Card
                title="Consommation de référence"
                value={result.consommation_actuelle}
                unit="unités"
                color="#38BDF8"
              />
              <Card
                title="Prédiction IA"
                value={Math.round(result.quantite_predite)}
                unit="unités"
                color="#10B981"
              />
              <Card
                title="Écart prévu"
                value={`${result.ecart >= 0 ? "+" : ""}${Math.round(
                  result.ecart
                )}`}
                unit="unités"
                color="#FACC15"
              />
              <Card
                title="Évolution"
                value={`${result.pourcentage_evolution >= 0 ? "+" : ""}${
                  result.pourcentage_evolution
                }%`}
                unit=""
                color="#0EA5E9"
              />
            </div>

            <section
              style={{
                padding: "1.2rem",
                borderRadius: "22px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#0F172A" }}>
                Historique mensuel des mouvements
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      <th style={thStyle}>Période</th>
                      <th style={thStyle}>Sorties</th>
                      <th style={thStyle}>Entrées</th>
                      <th style={thStyle}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historique.map((h) => {
                      const balance = h.total_entrees - h.total_sorties;

                      return (
                        <tr key={h.periode}>
                          <td style={tdStyle}>{h.mois_label}</td>
                          <td style={tdRightStyle}>
                            {h.total_sorties > 0
                              ? `-${h.total_sorties.toLocaleString("fr-FR")}`
                              : "—"}
                          </td>
                          <td style={tdRightStyle}>
                            {h.total_entrees > 0
                              ? `+${h.total_entrees.toLocaleString("fr-FR")}`
                              : "—"}
                          </td>
                          <td
                            style={{
                              ...tdRightStyle,
                              color: balance >= 0 ? "#059669" : "#DC2626",
                              fontWeight: 700,
                            }}
                          >
                            {balance.toLocaleString("fr-FR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {!result && !isLoading && !error && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              borderRadius: "22px",
              border: "2px dashed #BAE6FD",
              background: "rgba(240, 249, 255, 0.7)",
              color: "#0369A1",
              fontWeight: 600,
            }}
          >
            Choisissez les filtres puis lancez la prédiction.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", color: "#334155", fontWeight: 700 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({
  title,
  value,
  unit,
  color,
}: {
  title: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: "20px",
        background: `linear-gradient(135deg, ${color}22, #FFFFFF)`,
        border: `1px solid ${color}55`,
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "#64748B",
          fontWeight: 700,
        }}
      >
        {title}
      </p>
      <div style={{ marginTop: "10px" }}>
        <span
          style={{
            fontSize: "34px",
            fontWeight: 800,
            color: "#0F172A",
          }}
        >
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </span>
        {unit && (
          <span style={{ marginLeft: "6px", color: "#475569" }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  height: "44px",
  borderRadius: "14px",
  border: "1px solid #CBD5E1",
  padding: "0 12px",
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: "14px",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  color: "#475569",
  borderBottom: "1px solid #E2E8F0",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #E2E8F0",
  color: "#0F172A",
};

const tdRightStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "right",
};