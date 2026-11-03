import React from 'react';
import { OrbitalGroup } from '../utils/electronConfig';

interface OrbitalDiagramViewProps {
  orbitalDiagram: OrbitalGroup[];
  lang?: 'vi' | 'en';
}

export const OrbitalDiagramView: React.FC<OrbitalDiagramViewProps> = ({
  orbitalDiagram,
  lang = 'vi',
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px]">
            ↑
          </span>
          <span>{lang === 'vi' ? 'Electron độc thân (chưa ghép đôi)' : 'Unpaired electron'}</span>
        </span>
        <span className="flex items-center gap-1.5 ml-2">
          <span className="w-3.5 h-3.5 rounded bg-blue-500/20 border border-blue-500 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px]">
            ↑↓
          </span>
          <span>{lang === 'vi' ? 'Đã ghép đôi (bão hòa)' : 'Paired electrons'}</span>
        </span>
        <span className="flex items-center gap-1.5 ml-2">
          <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-transparent flex items-center justify-center text-[10px]">
            -
          </span>
          <span>{lang === 'vi' ? 'Orbital trống' : 'Empty orbital'}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {orbitalDiagram.map((group, groupIdx) => {
          return (
            <div
              key={`${group.subshellName}-${groupIdx}`}
              className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-2xs"
            >
              {/* Box row */}
              <div className="flex items-center gap-1">
                {group.orbitals.map((orb, oIdx) => {
                  const isUnpaired = orb.electrons === 1;
                  const isPaired = orb.electrons === 2;
                  const isEmpty = orb.electrons === 0;

                  let boxStyles =
                    'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-400';
                  if (isUnpaired) {
                    boxStyles =
                      'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30';
                  } else if (isPaired) {
                    boxStyles =
                      'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400';
                  }

                  return (
                    <div
                      key={orb.id || oIdx}
                      className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg border-2 flex items-center justify-center font-bold text-sm select-none transition-transform hover:scale-105 ${boxStyles}`}
                      title={`${group.subshellName} (m = ${orb.m}): ${
                        isEmpty
                          ? '0 electron (Trống)'
                          : isUnpaired
                          ? '1 electron độc thân (Spin: +1/2 ↑)'
                          : '2 electron đã ghép đôi (Spin: ↑↓)'
                      }`}
                    >
                      {isEmpty ? (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                      ) : (
                        <div className="flex items-center justify-center gap-0.5 tracking-tighter">
                          {orb.spinUp && (
                            <span className={isUnpaired ? 'text-emerald-500 dark:text-emerald-400 font-extrabold text-base' : 'text-blue-600 dark:text-blue-400'}>
                              ↑
                            </span>
                          )}
                          {orb.spinDown && (
                            <span className="text-blue-600 dark:text-blue-400 text-base">
                              ↓
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Subshell name label */}
              <div className="mt-1.5 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {group.subshellName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {group.count}/{group.capacity}e⁻
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
