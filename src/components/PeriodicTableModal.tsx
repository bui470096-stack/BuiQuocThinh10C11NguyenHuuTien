import React, { useEffect, useState } from 'react';
import { ELEMENTS, ElementData, CATEGORY_COLORS } from '../data/elements';
import { X, Search } from 'lucide-react';
import { removeAccents } from '../utils/electronConfig';

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (element: ElementData) => void;
  currentZ?: number;
  lang?: 'vi' | 'en';
}

// Periodic table grid layout coordinates
// Row 1: H (1,1), He (1,18)
// Row 2: Li (2,1), Be (2,2), B-Ne (2, 13-18)
// Row 3: Na (3,1), Mg (3,2), Al-Ar (3, 13-18)
// Row 4: K-Kr (4, 1-18)
// Row 5: Rb-Xe (5, 1-18)
// Row 6: Cs (6,1), Ba (6,2), [57-71 placeholder] (6,3), Hf-Rn (6, 4-18)
// Row 7: Fr (7,1), Ra (7,2), [89-103 placeholder] (7,3), Rf-Og (7, 4-18)
// Row 8 (Lanthanides 57-71): col 4-18
// Row 9 (Actinides 89-103): col 4-18

export const PeriodicTableModal: React.FC<PeriodicTableModalProps> = ({
  isOpen,
  onClose,
  onSelectElement,
  currentZ,
  lang = 'vi',
}) => {
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelVi: 'Tất cả', labelEn: 'All' },
    { id: 'alkali', labelVi: 'Kiềm', labelEn: 'Alkali' },
    { id: 'alkaline', labelVi: 'Kiềm thổ', labelEn: 'Alkaline Earth' },
    { id: 'transition', labelVi: 'Chuyển tiếp', labelEn: 'Transition' },
    { id: 'post-transition', labelVi: 'Kim loại khác', labelEn: 'Post-transition' },
    { id: 'metalloid', labelVi: 'Á kim', labelEn: 'Metalloids' },
    { id: 'nonmetal', labelVi: 'Phi kim', labelEn: 'Nonmetals' },
    { id: 'halogen', labelVi: 'Halogen', labelEn: 'Halogens' },
    { id: 'noble', labelVi: 'Khí hiếm', labelEn: 'Noble Gases' },
    { id: 'lanthanide', labelVi: 'Lantan', labelEn: 'Lanthanides' },
    { id: 'actinide', labelVi: 'Actini', labelEn: 'Actinides' },
  ];

  const getGridPosition = (el: ElementData): { row: number; col: number } => {
    const { z, period } = el;

    // Lanthanides: 57 to 71 -> row 8, col 4 to 18
    if (z >= 57 && z <= 71) {
      return { row: 8, col: z - 57 + 4 };
    }
    // Actinides: 89 to 103 -> row 9, col 4 to 18
    if (z >= 89 && z <= 103) {
      return { row: 9, col: z - 89 + 4 };
    }

    if (period === 1) {
      return z === 1 ? { row: 1, col: 1 } : { row: 1, col: 18 };
    }
    if (period === 2 || period === 3) {
      if (el.groupNumber <= 2) return { row: period, col: el.groupNumber };
      return { row: period, col: el.groupNumber };
    }
    if (period === 4 || period === 5) {
      return { row: period, col: el.groupNumber };
    }
    if (period === 6) {
      if (el.groupNumber <= 2) return { row: 6, col: el.groupNumber };
      // Hf (72) onwards -> col 4 to 18
      return { row: 6, col: el.groupNumber };
    }
    if (period === 7) {
      if (el.groupNumber <= 2) return { row: 7, col: el.groupNumber };
      return { row: 7, col: el.groupNumber };
    }

    return { row: period, col: el.groupNumber || 1 };
  };

  const matchesFilter = (el: ElementData): boolean => {
    if (selectedCategory !== 'all' && el.category !== selectedCategory) {
      return false;
    }
    if (!filterText.trim()) return true;
    const q = filterText.trim().toLowerCase();
    const qNorm = removeAccents(q);
    return (
      el.symbol.toLowerCase().includes(q) ||
      String(el.z) === q ||
      el.nameVi.toLowerCase().includes(q) ||
      removeAccents(el.nameVi).includes(qNorm) ||
      el.nameEn.toLowerCase().includes(q)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Bảng tuần hoàn 118 nguyên tố"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">
              118
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'vi' ? 'Bảng tuần hoàn nguyên tố hóa học' : 'Periodic Table of Elements'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi'
                  ? 'Bấm một ô để xem ngay cấu hình electron và đặc tính hóa học'
                  : 'Click an element to view configuration & chemical properties'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng tuần hoàn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Category legend */}
        <div className="p-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search box inside modal */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={lang === 'vi' ? 'Tìm nhanh (Fe, 26, Sắt, Iron)...' : 'Quick search...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-2 py-1 rounded-md whitespace-nowrap transition font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lang === 'vi' ? c.labelVi : c.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Periodic Table Grid container */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-slate-100/50 dark:bg-slate-950/40">
          <div className="min-w-[840px] select-none">
            {/* 18 Column headers */}
            <div className="grid grid-cols-18 gap-1 mb-1 text-[10px] text-center text-slate-400 font-semibold">
              {Array.from({ length: 18 }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Main grid rows 1 to 7 */}
            <div className="grid grid-cols-18 gap-1 auto-rows-[46px] sm:auto-rows-[52px]">
              {ELEMENTS.filter((el) => !(el.z >= 57 && el.z <= 71) && !(el.z >= 89 && el.z <= 103)).map(
                (el) => {
                  const pos = getGridPosition(el);
                  const isHighlighted = matchesFilter(el);
                  const isCurrent = currentZ === el.z;
                  const catColor = CATEGORY_COLORS[el.category] || {
                    bg: 'bg-slate-500/15',
                    text: 'text-slate-700 dark:text-slate-300',
                    border: 'border-slate-500/40',
                  };

                  return (
                    <button
                      key={el.z}
                      onClick={() => {
                        onSelectElement(el);
                        onClose();
                      }}
                      style={{
                        gridRowStart: pos.row,
                        gridColumnStart: pos.col,
                      }}
                      className={`relative flex flex-col items-center justify-center p-0.5 rounded-md border text-center transition-all group ${
                        catColor.bg
                      } ${catColor.border} ${catColor.text} ${
                        isCurrent
                          ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 z-10 font-bold scale-105 shadow-md'
                          : 'hover:scale-105 hover:z-10 hover:shadow-sm'
                      } ${!isHighlighted ? 'opacity-25 grayscale-[60%]' : 'opacity-100'}`}
                      title={`${el.z} - ${el.symbol}: ${el.nameVi} (${el.nameEn}) - Khối ${el.block}`}
                    >
                      <span className="text-[9px] leading-none opacity-70 absolute top-0.5 left-1">
                        {el.z}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold leading-tight">
                        {el.symbol}
                      </span>
                      <span className="text-[8px] sm:text-[9px] leading-none truncate max-w-full px-0.5 opacity-85">
                        {lang === 'vi' ? el.nameVi : el.nameEn}
                      </span>
                    </button>
                  );
                }
              )}

              {/* Lanthanide placeholder in row 6, col 3 */}
              <div
                style={{ gridRowStart: 6, gridColumnStart: 3 }}
                className="flex flex-col items-center justify-center p-1 rounded-md border border-dashed border-pink-400/50 bg-pink-500/10 text-pink-700 dark:text-pink-300 text-[10px] font-semibold text-center"
              >
                <span>57-71</span>
                <span className="text-[8px] truncate">La-Lu</span>
              </div>

              {/* Actinide placeholder in row 7, col 3 */}
              <div
                style={{ gridRowStart: 7, gridColumnStart: 3 }}
                className="flex flex-col items-center justify-center p-1 rounded-md border border-dashed border-indigo-400/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold text-center"
              >
                <span>89-103</span>
                <span className="text-[8px] truncate">Ac-Lr</span>
              </div>
            </div>

            {/* Separator for f-block */}
            <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

            {/* Lanthanide & Actinide rows */}
            <div className="grid grid-cols-18 gap-1 auto-rows-[46px] sm:auto-rows-[52px]">
              {/* Row label */}
              <div
                style={{ gridRowStart: 1, gridColumnStart: 1, gridColumnEnd: 4 }}
                className="flex items-center justify-end pr-2 text-xs font-semibold text-pink-600 dark:text-pink-400"
              >
                * {lang === 'vi' ? 'Họ Lantan' : 'Lanthanides'}
              </div>
              <div
                style={{ gridRowStart: 2, gridColumnStart: 1, gridColumnEnd: 4 }}
                className="flex items-center justify-end pr-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
              >
                ** {lang === 'vi' ? 'Họ Actini' : 'Actinides'}
              </div>

              {/* Lanthanides 57-71 */}
              {ELEMENTS.filter((el) => el.z >= 57 && el.z <= 71).map((el) => {
                const col = el.z - 57 + 4;
                const isHighlighted = matchesFilter(el);
                const isCurrent = currentZ === el.z;
                const catColor = CATEGORY_COLORS[el.category];

                return (
                  <button
                    key={el.z}
                    onClick={() => {
                      onSelectElement(el);
                      onClose();
                    }}
                    style={{ gridRowStart: 1, gridColumnStart: col }}
                    className={`relative flex flex-col items-center justify-center p-0.5 rounded-md border text-center transition-all ${
                      catColor.bg
                    } ${catColor.border} ${catColor.text} ${
                      isCurrent
                        ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 z-10 font-bold scale-105 shadow-md'
                        : 'hover:scale-105 hover:z-10 hover:shadow-sm'
                    } ${!isHighlighted ? 'opacity-25 grayscale-[60%]' : 'opacity-100'}`}
                    title={`${el.z} - ${el.symbol}: ${el.nameVi} (${el.nameEn})`}
                  >
                    <span className="text-[9px] leading-none opacity-70 absolute top-0.5 left-1">
                      {el.z}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold leading-tight">
                      {el.symbol}
                    </span>
                    <span className="text-[8px] sm:text-[9px] leading-none truncate max-w-full px-0.5 opacity-85">
                      {lang === 'vi' ? el.nameVi : el.nameEn}
                    </span>
                  </button>
                );
              })}

              {/* Actinides 89-103 */}
              {ELEMENTS.filter((el) => el.z >= 89 && el.z <= 103).map((el) => {
                const col = el.z - 89 + 4;
                const isHighlighted = matchesFilter(el);
                const isCurrent = currentZ === el.z;
                const catColor = CATEGORY_COLORS[el.category];

                return (
                  <button
                    key={el.z}
                    onClick={() => {
                      onSelectElement(el);
                      onClose();
                    }}
                    style={{ gridRowStart: 2, gridColumnStart: col }}
                    className={`relative flex flex-col items-center justify-center p-0.5 rounded-md border text-center transition-all ${
                      catColor.bg
                    } ${catColor.border} ${catColor.text} ${
                      isCurrent
                        ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 z-10 font-bold scale-105 shadow-md'
                        : 'hover:scale-105 hover:z-10 hover:shadow-sm'
                    } ${!isHighlighted ? 'opacity-25 grayscale-[60%]' : 'opacity-100'}`}
                    title={`${el.z} - ${el.symbol}: ${el.nameVi} (${el.nameEn})`}
                  >
                    <span className="text-[9px] leading-none opacity-70 absolute top-0.5 left-1">
                      {el.z}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold leading-tight">
                      {el.symbol}
                    </span>
                    <span className="text-[8px] sm:text-[9px] leading-none truncate max-w-full px-0.5 opacity-85">
                      {lang === 'vi' ? el.nameVi : el.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <span>
            {lang === 'vi'
              ? 'Mẹo: Nhấn phím Esc để đóng modal bất kỳ lúc nào.'
              : 'Tip: Press Esc to close anytime.'}
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {ELEMENTS.length} {lang === 'vi' ? 'nguyên tố' : 'elements'}
          </span>
        </div>
      </div>
    </div>
  );
};
