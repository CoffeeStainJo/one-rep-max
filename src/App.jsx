import React, { useEffect, useMemo, useState } from "react";

export default function OneRepMaxCalculator() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [formula, setFormula] = useState("brzycki");
  const [debouncedWeight, setDebouncedWeight] = useState(weight);
  const [debouncedReps, setDebouncedReps] = useState(reps);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedWeight(weight), 220);
    return () => clearTimeout(t);
  }, [weight]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedReps(reps), 220);
    return () => clearTimeout(t);
  }, [reps]);

  const formulas = {
    epley: (w, r) => (r <= 0 ? 0 : w * (1 + r / 30)),
    brzycki: (w, r) => (r <= 0 ? 0 : w * (36 / (37 - r))),
    lombardi: (w, r) => (r <= 0 ? 0 : w * Math.pow(r, 0.1)),
    mayhew: (w, r) => (r <= 0 ? 0 : (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r))),
  };

  const calcOneRepMax = (w, r, method) => {
    const fn = formulas[method] || formulas.brzycki;
    const val = fn(Number(w), Number(r));
    return Number.isFinite(val) && val > 0 ? val : 0;
  };

  const oneRepMax = useMemo(() => calcOneRepMax(debouncedWeight, debouncedReps, formula), [debouncedWeight, debouncedReps, formula]);

  const tableData = [
    { pct: 100, reps: 1 },
    { pct: 95, reps: 2 },
    { pct: 90, reps: 4 },
    { pct: 85, reps: 6 },
    { pct: 80, reps: 8 },
    { pct: 75, reps: 10 },
    { pct: 70, reps: 12 },
    { pct: 65, reps: 16 },
    { pct: 60, reps: 20 },
    { pct: 55, reps: 24 },
    { pct: 50, reps: 30 },
  ];

  const fmt = (n) => (n === 0 ? "—" : (Math.round(n * 10) / 10).toLocaleString());
  const id = (s) => `orm-${s}`;

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                if (confirm('New version available! Would you like to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => console.log('Service worker registration failed:', error));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-gray-900 shadow-xl rounded-2xl p-6 md:p-10 border border-gray-700">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">One-Rep Max Calculator</h1>
            <p className="text-sm text-gray-400 mt-1">Live estimates — no button needed.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-sm text-gray-400">Formula</div>
            <select
              aria-label="Select formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="rounded-lg border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100"
            >
              <option value="epley">Epley</option>
              <option value="brzycki">Brzycki</option>
              <option value="lombardi">Lombardi</option>
              <option value="mayhew">Mayhew</option>
            </select>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-gray-800 p-5 rounded-xl border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex-1">
                <label htmlFor={id("weight")} className="text-sm text-gray-300 font-medium">Weight (kg)</label>
                <div className="mt-2 flex gap-3 items-center">
                  <input
                    id={id("weight")}
                    inputMode="decimal"
                    type="number"
                    min="0"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="w-36">
                    <label htmlFor={id("reps")} className="text-sm text-gray-300 font-medium">Reps</label>
                    <input
                      id={id("reps")}
                      type="range"
                      min="1"
                      max="30"
                      value={reps}
                      onChange={(e) => setReps(Number(e.target.value))}
                      className="w-full mt-1 accent-indigo-500"
                    />
                    <div className="mt-1 text-sm text-gray-200 font-semibold">{reps} rep{reps > 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 bg-gray-900 rounded-xl p-4 shadow-inner border border-gray-700">
                <div className="text-xs text-gray-400">Estimated 1-Rep Max</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{fmt(oneRepMax)} <span className="text-base font-medium text-gray-400">kg</span></div>
                <div className="mt-3 text-sm text-gray-300">Formula: <span className="font-medium capitalize">{formula}</span></div>

                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => navigator.clipboard?.writeText(`${fmt(oneRepMax)} kg`)} className="flex-1 rounded-md border border-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-800">
                    Copy
                  </button>
                  <button type="button" onClick={() => alert('To share: copy the number or use your device\'s share features.')} className="rounded-md border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm">
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-200">Percentage of 1RM</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tableData.map((row) => (
                  <div key={row.pct} className="bg-gray-900 rounded-lg p-3 border border-gray-700 text-center">
                    <div className="text-xs text-gray-400">{row.pct}% — {row.reps} rep{row.reps > 1 ? 's' : ''}</div>
                    <div className="mt-1 font-semibold text-white">{fmt((oneRepMax * row.pct) / 100)} kg</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="bg-gray-900 rounded-xl p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-200">Percent Table</h4>
            <p className="text-xs text-gray-400 mt-1">Common training percentages from your estimated 1RM.</p>

            <div className="mt-4 space-y-3">
              {tableData.map((row) => (
                <div key={row.pct} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-gray-200">{row.pct}%</div>
                  <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div style={{ width: `${row.pct}%` }} className="h-3 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" />
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-gray-200">{fmt((oneRepMax * row.pct) / 100)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-400">
              <div className="font-medium text-gray-200">Notes</div>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Estimates are approximations — individual variance exists.</li>
                <li>Use lower reps/weights and proper warm-up when testing maxes.</li>
              </ul>
            </div>
          </aside>
        </main>

        <footer className="mt-6 text-xs text-gray-500 text-center">Built with ❤️ — dark mode optimized and accessible controls.</footer>
      </div>
    </div>
  );
}
