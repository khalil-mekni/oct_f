"use client";

import React from "react";
import {
  Package,
  Warehouse,
  CalendarDays,
  Sparkles,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  CalendarRange,
  Zap,
} from "lucide-react";

export type FilterParams = {
  emballageId: number;
  entrepotId: number | null;
  granularity: "day" | "month" | "year";
  selectedMonth: number;
  selectedYear: number;
  fromYear: number;
  toYear: number;
};

type Props = {
  params: FilterParams;
  onChange: (params: FilterParams) => void;
  onSubmit: () => void;
  onRecommend: () => void;
  loading: boolean;
};

const EMBALLAGES = [
  { id: 1, label: "Carton Thé Vert Supérieur 100g" },
  { id: 2, label: "Sac Riz Blanc" },
  { id: 3, label: "Sucre Blanc" },
  { id: 4, label: "Riz Étuvé" },
  { id: 5, label: "Sac Riz Basmati" },
  { id: 6, label: "Sac Complexe" },
  { id: 7, label: "Rouleaux Adhésifs" },
  { id: 8, label: "Thé Noir Ceylon 150g" },
  { id: 9, label: "Thé Noir Extra 250g" },
  { id: 10, label: "Thé Noir Extra Plus 100g" },
  { id: 11, label: "Thé Noir Extra Plus 250g" },
  { id: 12, label: "Thé Vert Bourgeon 250g" },
  { id: 15, label: "Film Thermo 200µ" },
  { id: 16, label: "Film Thermo 500µ" },
  { id: 17, label: "Film Étirable" },
  { id: 18, label: "Film Étirable GINOR" },
];

export const ENTREPOTS = [
  { id: 1, label: "Entrepôt Sousse" },
  { id: 2, label: "Entrepôt Gabes" },
  { id: 3, label: "Entrepôt Sfax" },
  { id: 4, label: "Entrepôt Goulette" },
  { id: 5, label: "Entrepôt Rades" },
  { id: 6, label: "Entrepôt Zarzis" },
  { id: 7, label: "Entrepôt Medenine" },
  { id: 8, label: "Entrepôt Beja" },
  { id: 9, label: "Entrepôt Kairaouan" },
  { id: 10, label: "Entrepôt Kef" },
  { id: 11, label: "Entrepôt Kasserine" },
  { id: 12, label: "Entrepôt Kebili" },
  { id: 13, label: "Entrepôt Sidi Bouzid" },
  { id: 14, label: "Entrepôt Makther" },
  { id: 15, label: "Entrepôt Gafsa" },
  { id: 16, label: "Entrepôt Tataouine" },
  { id: 17, label: "Entrepôt Touzer" },
];

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const YEARS = Array.from({ length: 8 }, (_, i) => currentYear + i);

const getAvailableMonths = (year: number) => {
  return MONTHS.map((name, index) => ({
    id: index + 1,
    label: name,
  })).filter((month) => {
    if (year === currentYear) {
      return month.id >= currentMonth;
    }

    return year > currentYear;
  });
};
const selectCls = `
  w-full appearance-none rounded-2xl border border-sky-100
  bg-white/90 px-4 py-3 pr-10 text-sm font-semibold text-slate-700
  shadow-sm outline-none transition-all duration-200
  focus:border-teal-300 focus:ring-4 focus:ring-teal-100/70
  hover:border-sky-200 hover:shadow-md cursor-pointer
`;

function SelectField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-teal-600">
        <Icon size={12} />
        {label}
      </label>

      <div className="relative">
        {children}
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-teal-400"
        />
      </div>
    </div>
  );
}

function SubmitButton({
  loading,
  onSubmit,
  onRecommend,
  granularity,
}: {
  loading: boolean;
  onSubmit: () => void;
  onRecommend: () => void;
  granularity: string;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`
          group relative flex-[2] overflow-hidden rounded-2xl px-8 py-3
          text-sm font-bold text-white shadow-lg shadow-teal-300/40
          transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60
          ${
            loading
              ? "bg-teal-500"
              : "bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-400/40 active:translate-y-0"
          }
        `}
      >
        {!loading && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}

        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Calcul…
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Lancer la prédiction
            </>
          )}
        </span>
      </button>

      {granularity === "month" && (
        <button
          type="button"
          onClick={onRecommend}
          disabled={loading}
          className="group relative flex-1 overflow-hidden rounded-2xl border-2 border-emerald-500 bg-white px-6 py-3 text-sm font-bold text-emerald-600 transition-all duration-300 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100 disabled:opacity-50"
        >
          <span className="relative flex items-center justify-center gap-2">
            <Zap size={15} className="fill-emerald-500" />
            Recommandation
          </span>
        </button>
      )}
    </div>
  );
}

export default function PredictionFilters({
  params,
  onChange,
  onSubmit,
  onRecommend,
  loading,
}: Props) {
  const set = (patch: Partial<FilterParams>) =>
    onChange({ ...params, ...patch });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-sky-50/70 to-teal-50/60 p-6 shadow-2xl shadow-sky-100/60 backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg shadow-teal-300/40">
          <SlidersHorizontal size={18} className="text-white" />
        </div>

        <div>
          <p className="text-base font-extrabold text-slate-800">
            Filtres de prédiction
          </p>
          <p className="text-xs text-slate-400">
            Sélectionnez l’emballage, l’entrepôt et la période à visualiser
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SelectField icon={Package} label="Emballage">
          <select
            value={params.emballageId ?? ""}
            onChange={(e) =>
              set({
                emballageId:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className={selectCls}
          >
            <option value="">Choisir un emballage...</option>
            {EMBALLAGES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </SelectField>

        <SelectField icon={Warehouse} label="Entrepôt">
          <select
            value={params.entrepotId ?? "all"}
            onChange={(e) =>
              set({
                entrepotId:
                  e.target.value === "all" ? null : Number(e.target.value),
              })
            }
            className={selectCls}
          >
            <option value="all">Tous les entrepôts</option>
            {ENTREPOTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </SelectField>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-teal-600">
            <CalendarDays size={12} />
            Visualisation
          </label>

          <div className="flex gap-1 rounded-2xl border border-sky-100 bg-white/80 p-1 shadow-sm">
            {(["day", "month", "year"] as const).map((g) => {
              const labels = {
                day: "Jour",
                month: "Mois",
                year: "Année",
              };

              const active = params.granularity === g;

              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => set({ granularity: g })}
                  className={`
                    flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md shadow-teal-200"
                        : "text-slate-400 hover:bg-sky-50 hover:text-teal-700"
                    }
                  `}
                >
                  {labels[g]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-5 h-px bg-gradient-to-r from-transparent via-teal-200/80 to-transparent" />

      {params.granularity === "day" && (
        <div>
          <p className="mb-3 text-xs font-semibold text-slate-500">
            Afficher la prédiction pour chaque jour du mois choisi.
          </p>

          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
            <SelectField icon={CalendarDays} label="Mois">
              <select
                value={params.selectedMonth}
                onChange={(e) =>
                  set({ selectedMonth: Number(e.target.value) })
                }
                className={selectCls}
              >
                {getAvailableMonths(params.selectedYear).map((m) => (
  <option key={m.id} value={m.id}>
    {m.label}
  </option>
))}
              </select>
            </SelectField>

            <SelectField icon={CalendarRange} label="Année">
  <select
    value={params.selectedYear}
    onChange={(e) => {
      const selectedYear = Number(e.target.value);
      const availableMonths = getAvailableMonths(selectedYear);

      set({
        selectedYear,
        selectedMonth: availableMonths[0]?.id ?? currentMonth,
      });
    }}
    className={selectCls}
  >
    {YEARS.map((y) => (
      <option key={y} value={y}>
        {y}
      </option>
    ))}
  </select>
</SelectField>

            <SubmitButton 
              loading={loading} 
              onSubmit={onSubmit} 
              onRecommend={onRecommend} 
              granularity={params.granularity} 
            />
          </div>
        </div>
      )}

      {params.granularity === "month" && (
        <div>
          <p className="mb-3 text-xs font-semibold text-slate-500">
            Afficher automatiquement les 12 mois de l’année choisie.
          </p>

          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto]">
            <SelectField icon={CalendarRange} label="Année">
              <select
                value={params.selectedYear}
                onChange={(e) => set({ selectedYear: Number(e.target.value) })}
                className={selectCls}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </SelectField>

            <SubmitButton 
              loading={loading} 
              onSubmit={onSubmit} 
              onRecommend={onRecommend} 
              granularity={params.granularity} 
            />
          </div>
        </div>
      )}

      {params.granularity === "year" && (
        <div>
          <p className="mb-3 text-xs font-semibold text-slate-500">
            Afficher la prédiction annuelle sur une plage d’années.
          </p>

          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
            <SelectField icon={CalendarRange} label="De l’année">
              <select
                value={params.fromYear}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  set({
                    fromYear: value,
                    toYear: params.toYear < value ? value : params.toYear,
                  });
                }}
                className={selectCls}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </SelectField>

            <SelectField icon={CalendarRange} label="À l’année">
              <select
                value={params.toYear}
                onChange={(e) => set({ toYear: Number(e.target.value) })}
                className={selectCls}
              >
                {YEARS.filter((y) => y >= params.fromYear).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </SelectField>

            <SubmitButton 
              loading={loading} 
              onSubmit={onSubmit} 
              onRecommend={onRecommend} 
              granularity={params.granularity} 
            />
          </div>
        </div>
      )}
    </div>
  );
}