import React from 'react';
import { CalculationResult } from '../utils/electronConfig';

interface BohrModelProps {
  result: CalculationResult;
  lang?: 'vi' | 'en';
}

export const BohrModel: React.FC<BohrModelProps> = ({ result, lang = 'vi' }) => {
  const { element, shellElectrons, protons, neutrons, totalElectrons, ionFormula } = result;

  const width = 360;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const nucleusRadius = 26;

  const totalShells = shellElectrons.length;
  const maxRadius = 160;
  const radiusStep = totalShells > 0 ? (maxRadius - nucleusRadius - 10) / totalShells : 20;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between w-full">
        <span>{lang === 'vi' ? 'Mô hình nguyên tử Bohr' : 'Bohr Atomic Model'}</span>
        <span className="text-[11px] text-slate-400">
          {totalElectrons} e⁻ | {protons} p⁺ | {neutrons} n⁰
        </span>
      </div>

      <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          aria-label={`Mô hình Bohr của ${ionFormula}`}
        >
          {/* Orbital Shell circles */}
          {shellElectrons.map((shell, idx) => {
            const radius = nucleusRadius + (idx + 1) * radiusStep;
            return (
              <g key={`shell-track-${shell.n}`}>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-300 dark:text-slate-700 stroke-1"
                />
                {/* Shell label */}
                <text
                  x={centerX}
                  y={centerY - radius - 3}
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
                >
                  {shell.name} ({shell.count}e⁻)
                </text>
              </g>
            );
          })}

          {/* Electrons on each shell */}
          {shellElectrons.map((shell, idx) => {
            const radius = nucleusRadius + (idx + 1) * radiusStep;
            const count = shell.count;
            if (count === 0) return null;

            return Array.from({ length: count }).map((_, eIdx) => {
              const angle = (2 * Math.PI * eIdx) / count - Math.PI / 2;
              const ex = centerX + radius * Math.cos(angle);
              const ey = centerY + radius * Math.sin(angle);

              return (
                <circle
                  key={`e-${shell.n}-${eIdx}`}
                  cx={ex}
                  cy={ey}
                  r={4}
                  className="fill-blue-500 dark:fill-blue-400 stroke-1 stroke-white dark:stroke-slate-900 shadow-sm"
                />
              );
            });
          })}

          {/* Nucleus */}
          <circle
            cx={centerX}
            cy={centerY}
            r={nucleusRadius}
            className="fill-gradient-to-r fill-indigo-600 dark:fill-indigo-500 drop-shadow-md"
          />
          <text
            x={centerX}
            y={centerY - 4}
            textAnchor="middle"
            className="fill-white font-black text-sm"
          >
            {element.symbol}
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="fill-indigo-100 text-[9px] font-semibold"
          >
            {protons}p {neutrons}n
          </text>
        </svg>
      </div>

      {/* Shell electron summary breakdown */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
        {shellElectrons.map((s) => (
          <span
            key={s.name}
            className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-semibold"
          >
            {s.name}: {s.count}
          </span>
        ))}
      </div>
    </div>
  );
};
