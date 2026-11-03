import React, { useState } from 'react';
import { ELEMENTS } from '../data/elements';
import { calculateElement } from '../utils/electronConfig';
import { X, ArrowRightLeft } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultZ1?: number;
  lang?: 'vi' | 'en';
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  defaultZ1 = 26, // Fe
  lang = 'vi',
}) => {
  const [z1, setZ1] = useState<number>(defaultZ1);
  const [charge1, setCharge1] = useState<number>(0);

  const [z2, setZ2] = useState<number>(defaultZ1 === 29 ? 24 : 29); // Cu or Cr
  const [charge2, setCharge2] = useState<number>(0);

  if (!isOpen) return null;

  const res1 = calculateElement(z1, charge1);
  const res2 = calculateElement(z2, charge2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="So sánh 2 nguyên tố hoặc ion"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'vi' ? 'So sánh 2 Nguyên tố / Ion' : 'Compare 2 Elements / Ions'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi'
                  ? 'Đối chiếu song song cấu hình, lớp electron, tính chất từ và hóa trị'
                  : 'Side-by-side comparison of configurations, shells, magnetism & valence'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng so sánh"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          {/* Selector 1 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-16">
              {lang === 'vi' ? 'Nguyên tử 1:' : 'Atom 1:'}
            </span>
            <select
              value={z1}
              onChange={(e) => setZ1(Number(e.target.value))}
              className="flex-1 text-xs sm:text-sm py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              {ELEMENTS.map((el) => (
                <option key={el.z} value={el.z}>
                  {el.z} - {el.symbol} ({lang === 'vi' ? el.nameVi : el.nameEn})
                </option>
              ))}
            </select>
            <select
              value={charge1}
              onChange={(e) => setCharge1(Number(e.target.value))}
              className="w-20 text-xs sm:text-sm py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value={0}>0 (Trung hòa)</option>
              <option value={1}>+1</option>
              <option value={2}>+2</option>
              <option value={3}>+3</option>
              <option value={4}>+4</option>
              <option value={-1}>-1</option>
              <option value={-2}>-2</option>
              <option value={-3}>-3</option>
            </select>
          </div>

          {/* Selector 2 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-16">
              {lang === 'vi' ? 'Nguyên tử 2:' : 'Atom 2:'}
            </span>
            <select
              value={z2}
              onChange={(e) => setZ2(Number(e.target.value))}
              className="flex-1 text-xs sm:text-sm py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              {ELEMENTS.map((el) => (
                <option key={el.z} value={el.z}>
                  {el.z} - {el.symbol} ({lang === 'vi' ? el.nameVi : el.nameEn})
                </option>
              ))}
            </select>
            <select
              value={charge2}
              onChange={(e) => setCharge2(Number(e.target.value))}
              className="w-20 text-xs sm:text-sm py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              <option value={0}>0 (Trung hòa)</option>
              <option value={1}>+1</option>
              <option value={2}>+2</option>
              <option value={3}>+3</option>
              <option value={4}>+4</option>
              <option value={-1}>-1</option>
              <option value={-2}>-2</option>
              <option value={-3}>-3</option>
            </select>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1 */}
          {res1.result ? (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {res1.result.ionFormula}
                  </span>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {lang === 'vi' ? res1.result.element.nameVi : res1.result.element.nameEn} (Z = {res1.result.element.z})
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">
                  {res1.result.element.categoryVi}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                  {lang === 'vi' ? 'Cấu hình rút gọn:' : 'Condensed configuration:'}
                </span>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {res1.result.shortString}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                  {lang === 'vi' ? 'Cấu hình đầy đủ theo lớp:' : 'Full configuration by shell:'}
                </span>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-words">
                  {res1.result.fullShellString}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Tổng electron:' : 'Total electrons:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {res1.result.totalElectrons} e⁻
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Lớp K, L, M, N...:' : 'Shells K, L, M...:'}</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {res1.result.shellString}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Electron độc thân:' : 'Unpaired e⁻:'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {res1.result.unpairedCount}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Tính chất từ:' : 'Magnetic:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {res1.result.unpairedCount > 0 ? 'Thuận từ' : 'Nghịch từ'}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400 block">{lang === 'vi' ? 'Electron hóa trị:' : 'Valence electrons:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {res1.result.valenceElectrons} e⁻
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-red-500">{res1.error}</div>
          )}

          {/* Card 2 */}
          {res2.result ? (
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {res2.result.ionFormula}
                  </span>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {lang === 'vi' ? res2.result.element.nameVi : res2.result.element.nameEn} (Z = {res2.result.element.z})
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">
                  {res2.result.element.categoryVi}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                  {lang === 'vi' ? 'Cấu hình rút gọn:' : 'Condensed configuration:'}
                </span>
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {res2.result.shortString}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                  {lang === 'vi' ? 'Cấu hình đầy đủ theo lớp:' : 'Full configuration by shell:'}
                </span>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-words">
                  {res2.result.fullShellString}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Tổng electron:' : 'Total electrons:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {res2.result.totalElectrons} e⁻
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Lớp K, L, M, N...:' : 'Shells K, L, M...:'}</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {res2.result.shellString}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Electron độc thân:' : 'Unpaired e⁻:'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {res2.result.unpairedCount}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">{lang === 'vi' ? 'Tính chất từ:' : 'Magnetic:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {res2.result.unpairedCount > 0 ? 'Thuận từ' : 'Nghịch từ'}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400 block">{lang === 'vi' ? 'Electron hóa trị:' : 'Valence electrons:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {res2.result.valenceElectrons} e⁻
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-red-500">{res2.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};
