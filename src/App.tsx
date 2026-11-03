/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ELEMENTS, ElementData, CATEGORY_COLORS } from './data/elements';
import {
  calculateElement,
  parseInput,
  removeAccents,
  CalculationResult,
  toSuperscript,
} from './utils/electronConfig';
import { PeriodicTableModal } from './components/PeriodicTableModal';
import { OrbitalDiagramView } from './components/OrbitalDiagramView';
import { BohrModel } from './components/BohrModel';
import { QuizModal } from './components/QuizModal';
import { CompareModal } from './components/CompareModal';
import {
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Moon,
  Sun,
  RotateCcw,
  AlertTriangle,
  Award,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Atom,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Theme & Language
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  // Input & Query State
  const [inputText, setInputText] = useState<string>('Fe');
  const [selectedCharge, setSelectedCharge] = useState<number>(0);
  const [autocompleteItems, setAutocompleteItems] = useState<ElementData[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  // Calculation Result & Error
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [expandAufbau, setExpandAufbau] = useState<boolean>(true);

  // History (in-memory JS array of up to 10 lookups)
  const [history, setHistory] = useState<Array<{ symbol: string; charge: number; label: string }>>([
    { symbol: 'Fe', charge: 0, label: 'Fe' },
    { symbol: 'Cu', charge: 0, label: 'Cu' },
    { symbol: 'Cr', charge: 0, label: 'Cr' },
    { symbol: 'Cl', charge: -1, label: 'Cl⁻' },
    { symbol: 'Na', charge: 1, label: 'Na⁺' },
  ]);

  // Modals
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial calculation on load
  useEffect(() => {
    handleCalculate('Fe', 0);
  }, []);

  // Handle autocomplete matching
  useEffect(() => {
    const raw = inputText.trim();
    if (!raw) {
      setAutocompleteItems([]);
      setShowAutocomplete(false);
      return;
    }

    const { cleanQuery } = parseInput(raw);
    const qLower = cleanQuery.toLowerCase();
    const qNorm = removeAccents(cleanQuery);

    const matches = ELEMENTS.filter((el) => {
      return (
        el.symbol.toLowerCase() === qLower ||
        String(el.z) === qLower ||
        el.nameVi.toLowerCase().startsWith(qLower) ||
        removeAccents(el.nameVi).startsWith(qNorm) ||
        el.nameEn.toLowerCase().startsWith(qLower) ||
        el.symbol.toLowerCase().startsWith(qLower)
      );
    }).slice(0, 6);

    setAutocompleteItems(matches);
  }, [inputText]);

  // Click outside autocomplete to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Master calculate handler
  const handleCalculate = (targetQuery?: string, targetCharge?: number) => {
    const rawToUse = targetQuery !== undefined ? targetQuery : inputText;
    const { cleanQuery, detectedCharge, hasChargeInInput } = parseInput(rawToUse);

    // If charge is explicitly specified in the text input (e.g. Fe3+), prioritize it
    let chargeToUse = targetCharge !== undefined ? targetCharge : selectedCharge;
    if (hasChargeInInput) {
      chargeToUse = detectedCharge;
      setSelectedCharge(detectedCharge);
    }

    if (!cleanQuery.trim()) {
      setErrorMessage(
        lang === 'vi'
          ? 'Vui lòng nhập ký hiệu (Fe, Cu, Na), số hiệu Z (26, 29) hoặc tên nguyên tố.'
          : 'Please enter a symbol, atomic number Z, or element name.'
      );
      setResult(null);
      return;
    }

    const calc = calculateElement(cleanQuery, chargeToUse);

    if (calc.success && calc.result) {
      setResult(calc.result);
      setErrorMessage(null);
      setShowAutocomplete(false);

      // Add to JS history
      const itemLabel = calc.result.ionFormula;
      setHistory((prev) => {
        const filtered = prev.filter(
          (h) => !(h.symbol === calc.result!.element.symbol && h.charge === chargeToUse)
        );
        return [{ symbol: calc.result!.element.symbol, charge: chargeToUse, label: itemLabel }, ...filtered].slice(
          0,
          10
        );
      });
    } else {
      setErrorMessage(calc.error || 'Đã xảy ra lỗi khi tính toán cấu hình.');
      setResult(null);
    }
  };

  // Step to previous / next element
  const handleStepElement = (direction: -1 | 1) => {
    const currentZ = result?.element.z || 1;
    let nextZ = currentZ + direction;
    if (nextZ < 1) nextZ = 118;
    if (nextZ > 118) nextZ = 1;

    const nextEl = ELEMENTS[nextZ - 1];
    setInputText(nextEl.symbol);
    setSelectedCharge(0);
    handleCalculate(nextEl.symbol, 0);
  };

  // Copy full configuration to clipboard
  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.ionFormula}: ${result.shortString} (${result.fullShellString})`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight hidden sm:inline">
              {lang === 'vi' ? 'Hóa học Phổ thông' : 'Chemistry Suite'}
            </span>
          </div>

          {/* Quick utility buttons */}
          <div className="flex items-center gap-2">
            {/* Compare modal trigger */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
              title="So sánh 2 nguyên tố hoặc ion"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{lang === 'vi' ? 'So sánh' : 'Compare'}</span>
            </button>

            {/* Quiz modal trigger */}
            <button
              onClick={() => setIsQuizOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
              title="Luyện tập trắc nghiệm cấu hình electron"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{lang === 'vi' ? 'Trắc nghiệm' : 'Quiz'}</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang((prev) => (prev === 'vi' ? 'en' : 'vi'))}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Chuyển đổi ngôn ngữ Việt / Anh"
            >
              {lang === 'vi' ? 'VI' : 'EN'}
            </button>

            {/* Dark / Light toggle */}
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              aria-label="Chuyển chế độ sáng / tối"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* MANDATORY SECTION 1: Tiêu đề lớn: "Tính cấu hình electron" */}
        <section className="text-center space-y-1.5 pt-2">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'vi' ? 'Tính cấu hình electron' : 'Electron Configuration Calculator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {lang === 'vi'
              ? 'Tra cứu và giải cấu hình electron 118 nguyên tố hóa học, ion âm & dương, sơ đồ orbital, mức năng lượng và tính chất từ theo chuẩn SGK Hóa học Việt Nam.'
              : 'Calculate and visualize electron configurations for all 118 elements & ions, complete with orbital diagrams, shells, and magnetic properties.'}
          </p>
        </section>

        {/* INPUT & CONTROL PANEL (Strict Order: 2. Input + Button "+", 3. Charge selector, 4. Submit button) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
          {/* MANDATORY SECTION 2: Ô nhập nguyên tố nằm ngay dưới tiêu đề, kèm nút "+" bên cạnh */}
          <div className="space-y-1.5">
            <label
              htmlFor="element-input"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              {lang === 'vi' ? 'Nguyên tố hoặc Ion cần tra cứu:' : 'Element or Ion:'}
            </label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="element-input"
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCalculate();
                      setShowAutocomplete(false);
                    } else if (e.key === 'ArrowDown' && autocompleteItems.length > 0) {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) =>
                        prev < autocompleteItems.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === 'ArrowUp' && autocompleteItems.length > 0) {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) =>
                        prev > 0 ? prev - 1 : autocompleteItems.length - 1
                      );
                    }
                  }}
                  placeholder={
                    lang === 'vi'
                      ? 'Nhập ký hiệu (Fe, Cu, Na), số Z (26, 29), tên (sắt, iron) hoặc ion (Fe3+, Cl-)...'
                      : 'Enter symbol (Fe, Cu), Z (26), name (iron), or ion (Fe3+, Cl-)...'
                  }
                  className="w-full pl-11 pr-4 py-3 text-sm sm:text-base font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
                  autoComplete="off"
                />

                {/* Autocomplete Suggestions Dropdown */}
                {showAutocomplete && autocompleteItems.length > 0 && (
                  <div
                    ref={autocompleteRef}
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {autocompleteItems.map((el, index) => {
                      const isSelected = index === activeSuggestionIndex;
                      return (
                        <button
                          key={el.z}
                          type="button"
                          onClick={() => {
                            setInputText(el.symbol);
                            setShowAutocomplete(false);
                            handleCalculate(el.symbol, selectedCharge);
                          }}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                              {el.z}
                            </span>
                            <div>
                              <strong className="text-slate-900 dark:text-white font-extrabold mr-1.5">
                                {el.symbol}
                              </strong>
                              <span className="text-slate-600 dark:text-slate-400">
                                {lang === 'vi' ? el.nameVi : el.nameEn}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {lang === 'vi' ? el.categoryVi : el.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nút "+" mở modal chọn nguyên tố: lưới 118 ô theo bố cục bảng tuần hoàn */}
              <button
                type="button"
                onClick={() => setIsPeriodicTableOpen(true)}
                aria-label="Mở bảng tuần hoàn để chọn nguyên tố"
                className="h-12 px-3.5 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
                title={lang === 'vi' ? 'Mở bảng tuần hoàn 118 nguyên tố' : 'Open 118 Periodic Table'}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold">
                  {lang === 'vi' ? 'Bảng tuần hoàn' : 'Table'}
                </span>
              </button>
            </div>
          </div>

          {/* MANDATORY SECTION 3: Dòng chọn điện tích ion ngay dưới ô nhập: dropdown hoặc nút tăng/giảm từ -3 đến +4, mặc định 0 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {lang === 'vi' ? 'Điện tích Ion (từ -3 đến +4):' : 'Ion Charge (-3 to +4):'}
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {selectedCharge === 0
                  ? (lang === 'vi' ? 'Nguyên tử trung hòa (0)' : 'Neutral atom (0)')
                  : selectedCharge > 0
                  ? `Cation (+${selectedCharge})`
                  : `Anion (${selectedCharge})`}
              </span>
            </div>

            {/* Quick buttons and dropdown for charge */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[-3, -2, -1, 0, 1, 2, 3, 4].map((charge) => {
                const isActive = selectedCharge === charge;
                let label = String(charge);
                if (charge > 0) label = `+${charge}`;
                if (charge === 0) label = '0 (Trung hòa)';

                return (
                  <button
                    key={charge}
                    type="button"
                    onClick={() => {
                      setSelectedCharge(charge);
                      handleCalculate(inputText, charge);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MANDATORY SECTION 4: Nút "Xem cấu hình" (Enter cũng kích hoạt). Bấm thì tính và hiển thị kết quả bên dưới */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Quick Previous Button */}
            <button
              type="button"
              onClick={() => handleStepElement(-1)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={lang === 'vi' ? 'Nguyên tố liền trước' : 'Previous element'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={() => handleCalculate()}
              className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-5 h-5" />
              <span>{lang === 'vi' ? 'Xem cấu hình electron' : 'View Electron Configuration'}</span>
            </button>

            {/* Quick Next Button */}
            <button
              type="button"
              onClick={() => handleStepElement(1)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={lang === 'vi' ? 'Nguyên tố liền sau' : 'Next element'}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recent History Tags */}
          {history.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs text-slate-400">
              <span className="shrink-0">{lang === 'vi' ? 'Gần đây:' : 'Recent:'}</span>
              {history.map((h, i) => (
                <button
                  key={`${h.symbol}-${h.charge}-${i}`}
                  onClick={() => {
                    setInputText(h.symbol);
                    setSelectedCharge(h.charge);
                    handleCalculate(h.symbol, h.charge);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition"
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* MANDATORY SECTION 5: KHU VỰC KẾT QUẢ DẠNG CÁC THẺ (CARD) VỚI HIỆU ỨNG FADE-IN NHẸ */}
        {result && (
          <div className="space-y-4 animate-fade-in pb-12">
            {/* Top Notification for Predicted / Isoelectronic / Exception */}
            <div className="flex flex-col gap-2">
              {result.isPredicted && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs sm:text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    <strong>Cấu hình dự đoán:</strong> Nguyên tố có Z &gt; 103 là nguyên tố siêu nặng, cấu hình này được tính toán từ các mô hình lý thuyết tương đối tính (chưa hoàn toàn xác nhận bằng thực nghiệm).
                  </span>
                </div>
              )}

              {result.isoelectronicWith && (
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{result.isoelectronicWith}</span>
                </div>
              )}
            </div>

            {/* =========================================================================
                CARD 1: Thông tin nguyên tố
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm"
                    style={{
                      backgroundColor: `${result.element.color}20`,
                      borderColor: result.element.color,
                      borderWidth: '2px',
                      color: result.element.color,
                    }}
                  >
                    <span className="text-[10px] leading-none opacity-80">{result.element.z}</span>
                    <span className="text-xl leading-tight font-extrabold">{result.ionFormula}</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {lang === 'vi' ? result.element.nameVi : result.element.nameEn}
                      <span className="ml-2 text-xs font-semibold text-slate-400">
                        ({result.element.nameEn})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{lang === 'vi' ? result.element.categoryVi : result.element.category}</span>
                      <span>•</span>
                      <span>Khối {result.element.block}</span>
                      <span>•</span>
                      <span>{lang === 'vi' ? result.element.phase : result.element.phaseEn}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {lang === 'vi' ? 'Đã sao chép!' : 'Copied!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'vi' ? 'Sao chép cấu hình' : 'Copy config'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid of properties */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">{lang === 'vi' ? 'Số hiệu Z:' : 'Atomic number Z:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{result.element.z}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">{lang === 'vi' ? 'Khối lượng NT:' : 'Atomic mass:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{result.element.mass} u</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">{lang === 'vi' ? 'Chu kỳ & Nhóm:' : 'Period & Group:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    CK {result.element.period} • Nhóm {result.element.group}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">{lang === 'vi' ? 'Số hạt (p, n, e):' : 'Particles (p, n, e):'}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {result.protons}p, {result.neutrons}n, {result.totalElectrons}e
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                CARD 2: Cấu hình electron đầy đủ (mức năng lượng & theo lớp n)
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{lang === 'vi' ? 'Cấu hình electron đầy đủ' : 'Full Electron Configuration'}</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60">
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block mb-1">
                    {lang === 'vi' ? 'Theo thứ tự phân mức năng lượng (Madelung / Klechkovski):' : 'By Energy Level Order:'}
                  </span>
                  <p className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide break-words">
                    {result.fullEnergyString}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {lang === 'vi' ? 'Theo thứ tự lớp electron (n tăng dần):' : 'By Shell Order (n increasing):'}
                  </span>
                  <p className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide break-words">
                    {result.fullShellString}
                  </p>
                </div>
              </div>
            </div>

            {/* =========================================================================
                CARD 3: Cấu hình rút gọn bằng khí hiếm
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Atom className="w-4 h-4 text-purple-600" />
                <span>{lang === 'vi' ? 'Cấu hình electron rút gọn' : 'Condensed Configuration'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-base sm:text-lg font-black text-purple-900 dark:text-purple-200 tracking-wide">
                    {result.shortString}
                  </p>
                  {result.shortNote && (
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      {result.shortNote}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shrink-0 self-start sm:self-auto">
                  {lang === 'vi' ? 'Khí hiếm gần nhất' : 'Nearest Noble Gas'}
                </span>
              </div>
            </div>

            {/* =========================================================================
                CARD 4: Sơ đồ orbital (ô lượng tử)
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'vi' ? 'Sơ đồ Orbital (Ô lượng tử)' : 'Orbital Diagram'}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {result.unpairedCount} {lang === 'vi' ? 'electron độc thân' : 'unpaired electrons'}
                </span>
              </div>

              <OrbitalDiagramView orbitalDiagram={result.orbitalDiagram} lang={lang} />
            </div>

            {/* =========================================================================
                CARD 5: Số electron ở từng lớp K, L, M, N, O, P, Q + Mô hình Bohr
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Atom className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'vi' ? 'Số electron ở từng lớp (K, L, M, N, O, P, Q)' : 'Electrons per Shell'}</span>
                </div>
                <span className="font-mono text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                  [{result.shellString}]
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Table representation */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="py-2 px-2.5 font-semibold">{lang === 'vi' ? 'Lớp (n)' : 'Shell (n)'}</th>
                        <th className="py-2 px-2.5 font-semibold">{lang === 'vi' ? 'Tên lớp' : 'Shell name'}</th>
                        <th className="py-2 px-2.5 font-semibold text-right">{lang === 'vi' ? 'Số electron' : 'Electrons'}</th>
                        <th className="py-2 px-2.5 font-semibold text-right">{lang === 'vi' ? 'Tối đa (2n²)' : 'Max (2n²)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {result.shellElectrons.map((shell) => {
                        const maxCapacity = 2 * shell.n * shell.n;
                        return (
                          <tr key={shell.n} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-2.5 font-bold text-slate-800 dark:text-slate-200">
                              n = {shell.n}
                            </td>
                            <td className="py-2 px-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                              Lớp {shell.name}
                            </td>
                            <td className="py-2 px-2.5 text-right font-black text-slate-900 dark:text-white">
                              {shell.count} e⁻
                            </td>
                            <td className="py-2 px-2.5 text-right text-slate-400">
                              {maxCapacity} e⁻
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* SVG Bohr Model visualizer */}
                <BohrModel result={result} lang={lang} />
              </div>
            </div>

            {/* =========================================================================
                CARD 6: Số electron ở từng phân lớp s, p, d, f kèm biểu đồ cột
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'vi' ? 'Số electron theo phân lớp (s, p, d, f)' : 'Electrons per Subshell (s, p, d, f)'}</span>
                </div>
                <span className="text-xs text-slate-400">
                  s={result.subshellCounts.s}, p={result.subshellCounts.p}, d={result.subshellCounts.d}, f={result.subshellCounts.f}
                </span>
              </div>

              {/* Bar chart */}
              <div className="space-y-2.5 pt-1">
                {[
                  { type: 's', count: result.subshellCounts.s, color: 'bg-red-500', max: 14 },
                  { type: 'p', count: result.subshellCounts.p, color: 'bg-amber-500', max: 36 },
                  { type: 'd', count: result.subshellCounts.d, color: 'bg-blue-500', max: 40 },
                  { type: 'f', count: result.subshellCounts.f, color: 'bg-purple-500', max: 28 },
                ].map((item) => {
                  const percent = Math.min(100, Math.round((item.count / 40) * 100));
                  return (
                    <div key={item.type} className="flex items-center gap-3 text-xs">
                      <span className="w-6 font-extrabold uppercase text-slate-700 dark:text-slate-300 text-sm">
                        {item.type}
                      </span>
                      <div className="flex-1 h-5 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div
                          className={`h-full ${item.color} transition-all duration-500 rounded-md`}
                          style={{ width: `${Math.max(item.count > 0 ? 4 : 0, percent)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {item.count} e⁻
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =========================================================================
                CARD 7: Số electron độc thân & Tính chất từ
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'vi' ? 'Tính chất từ & Electron độc thân' : 'Magnetism & Unpaired Electrons'}</span>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    result.unpairedCount > 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {result.magneticProperty}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <p>
                  <strong>{lang === 'vi' ? 'Số electron độc thân:' : 'Unpaired electrons:'} </strong>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base mx-1">
                    {result.unpairedCount}
                  </span>
                  ({result.unpairedCount > 0 ? 'có electron chưa ghép đôi' : 'không có electron độc thân'}).
                </p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                  {result.magneticDescription}
                </p>
              </div>
            </div>

            {/* =========================================================================
                CARD 8: Electron hóa trị kèm giải thích & 4 số lượng tử
               ========================================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Atom className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'vi' ? 'Electron hóa trị & Số lượng tử' : 'Valence Electrons & Quantum Numbers'}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black border border-amber-200 dark:border-amber-800">
                  {result.valenceElectrons} {lang === 'vi' ? 'electron hóa trị' : 'valence electrons'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-1.5">
                <p>{result.valenceExplanation}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong>{lang === 'vi' ? 'Số oxi hóa phổ biến:' : 'Common oxidation states:'} </strong>
                  {result.element.commonOxidationStates.map((ox) => (ox > 0 ? `+${ox}` : String(ox))).join(', ')}
                </p>
              </div>

              {/* 4 Quantum numbers of last electron */}
              {result.lastQuantumNumbers && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    {lang === 'vi'
                      ? '4 số lượng tử của electron cuối cùng (chót):'
                      : 'Four quantum numbers of the last electron:'}
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">{lang === 'vi' ? 'Chính n' : 'Principal n'}</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{result.lastQuantumNumbers.n}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">{lang === 'vi' ? 'Phụ l' : 'Azimuthal l'}</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{result.lastQuantumNumbers.l}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">{lang === 'vi' ? 'Từ m_l' : 'Magnetic m'}</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">
                        {result.lastQuantumNumbers.m > 0 ? `+${result.lastQuantumNumbers.m}` : result.lastQuantumNumbers.m}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">{lang === 'vi' ? 'Spin m_s' : 'Spin s'}</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{result.lastQuantumNumbers.s}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================================
                CARD 9: Ghi chú ngoại lệ (nếu có: Cr, Cu, Nb, Mo, Pd, Ag, Pt, Au...)
               ========================================================================= */}
            {result.exceptionInfo?.isException && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400/80 dark:border-amber-700 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200">
                  <span className="text-lg">⚠️</span>
                  <span>
                    {lang === 'vi'
                      ? `Ngoại lệ cấu hình electron thực nghiệm (${result.element.symbol}, Z = ${result.element.z})`
                      : `Experimental Anomalous Configuration (${result.element.symbol})`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800 text-xs sm:text-sm space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block">
                        {lang === 'vi' ? 'Theo quy tắc Madelung lý thuyết:' : 'Theoretical Aufbau:'}
                      </span>
                      <span className="line-through text-slate-400 text-xs sm:text-sm">
                        {result.exceptionInfo.madelungConfigStr}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-700 dark:text-amber-300 font-sans block font-semibold">
                        {lang === 'vi' ? 'Thực nghiệm NIST / IUPAC:' : 'Actual NIST / IUPAC:'}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm">
                        {result.exceptionInfo.actualConfigStr}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 pt-1 border-t border-amber-200 dark:border-amber-800/60 leading-relaxed">
                    <strong>{lang === 'vi' ? 'Giải thích khoa học: ' : 'Scientific explanation: '}</strong>
                    {result.exceptionInfo.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* =========================================================================
                CARD 10: Các bước giải thích theo Aufbau, Pauli, Hund (Thu gọn / Mở rộng)
               ========================================================================= */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandAufbau((prev) => !prev)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>
                    {lang === 'vi'
                      ? 'Các bước giải thích chi tiết (Nguyên lý Aufbau, Pauli, Hund)'
                      : 'Step-by-Step Pedagogical Explanation (Aufbau, Pauli, Hund)'}
                  </span>
                </div>
                {expandAufbau ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandAufbau && (
                <div className="px-4 pb-5 sm:px-5 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <ul className="space-y-2 list-disc list-inside">
                    {result.aufbauSteps.map((step, idx) => (
                      <li key={idx} className="pl-1">
                        {step}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <p>
                      <strong>1. Nguyên lý vững bền (Aufbau):</strong> Trong nguyên tử ở trạng thái cơ bản, các electron lần lượt chiếm các orbital có mức năng lượng từ thấp đến cao (1s 2s 2p 3s 3p 4s 3d 4p...).
                    </p>
                    <p>
                      <strong>2. Nguyên lý loại trừ Pauli:</strong> Trong một orbital chỉ có thể chứa tối đa 2 electron và 2 electron này phải có spin ngược nhau (↑↓).
                    </p>
                    <p>
                      <strong>3. Quy tắc Hund:</strong> Trong cùng một phân lớp, các electron có xu hướng phân bố đều vào các orbital sao cho số electron độc thân là lớn nhất và các electron này phải có chiều spin song song (cùng hướng ↑).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        <p>
          Ứng dụng &quot;Tính cấu hình electron&quot; • Đầy đủ 118 nguyên tố bảng tuần hoàn hiện đại theo chuẩn SGK Hóa học Việt Nam & NIST/IUPAC.
        </p>
      </footer>

      {/* Modals */}
      <PeriodicTableModal
        isOpen={isPeriodicTableOpen}
        onClose={() => setIsPeriodicTableOpen(false)}
        onSelectElement={(el) => {
          setInputText(el.symbol);
          setSelectedCharge(0);
          handleCalculate(el.symbol, 0);
        }}
        currentZ={result?.element.z}
        lang={lang}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lang={lang}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        defaultZ1={result?.element.z || 26}
        lang={lang}
      />
    </div>
  );
}
