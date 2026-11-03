import React, { useState, useEffect } from 'react';
import { ELEMENTS, ElementData } from '../data/elements';
import { calculateElement, HARDCODED_EXCEPTIONS } from '../utils/electronConfig';
import { X, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'vi' | 'en';
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, lang = 'vi' }) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const generateRandomQuestion = (): QuizQuestion => {
    const questionType = Math.floor(Math.random() * 4); // 0, 1, 2, 3

    if (questionType === 0) {
      // Type 0: Configuration of an element
      const targetZ = Math.floor(Math.random() * 36) + 1; // 1 to 36 (most common in school)
      const el = ELEMENTS[targetZ - 1];
      const correctRes = calculateElement(el.z);
      const correctConfig = correctRes.result?.shortString || '';

      // Distractors
      const distractors = new Set<string>();
      while (distractors.size < 3) {
        const offset = (Math.floor(Math.random() * 7) - 3) || 1;
        const fakeZ = Math.min(36, Math.max(1, targetZ + offset));
        if (fakeZ !== targetZ) {
          const fakeRes = calculateElement(fakeZ);
          if (fakeRes.result?.shortString && fakeRes.result.shortString !== correctConfig) {
            distractors.add(fakeRes.result.shortString);
          }
        }
      }

      const options = Array.from(distractors);
      const correctIndex = Math.floor(Math.random() * 4);
      options.splice(correctIndex, 0, correctConfig);

      return {
        prompt:
          lang === 'vi'
            ? `Cấu hình electron rút gọn của nguyên tố ${el.nameVi} (${el.symbol}, Z = ${el.z}) là gì?`
            : `What is the condensed electron configuration of ${el.nameEn} (${el.symbol}, Z = ${el.z})?`,
        options,
        correctIndex,
        explanation:
          lang === 'vi'
            ? `Nguyên tố ${el.symbol} có Z = ${el.z}. Cấu hình đầy đủ: ${correctRes.result?.fullShellString}. Cấu hình rút gọn là: ${correctConfig}.`
            : `${el.symbol} has Z = ${el.z}. Full configuration: ${correctRes.result?.fullShellString}. Condensed form: ${correctConfig}.`,
      };
    } else if (questionType === 1) {
      // Type 1: Unpaired electrons count
      const testCases = [
        { id: 'Cr', charge: 0, label: 'Crom (Cr)' },
        { id: 'Fe', charge: 0, label: 'Sắt (Fe)' },
        { id: 'Fe', charge: 2, label: 'Ion Fe²⁺' },
        { id: 'Fe', charge: 3, label: 'Ion Fe³⁺' },
        { id: 'Cu', charge: 0, label: 'Đồng (Cu)' },
        { id: 'Cu', charge: 2, label: 'Ion Cu²⁺' },
        { id: 'O', charge: 0, label: 'Oxi (O)' },
        { id: 'N', charge: 0, label: 'Nitơ (N)' },
        { id: 'Mn', charge: 0, label: 'Mangan (Mn)' },
        { id: 'Ni', charge: 0, label: 'Niken (Ni)' },
      ];
      const tc = testCases[Math.floor(Math.random() * testCases.length)];
      const res = calculateElement(tc.id, tc.charge);
      const correctCount = res.result?.unpairedCount ?? 0;

      const optsSet = new Set<number>([correctCount]);
      while (optsSet.size < 4) {
        optsSet.add(Math.floor(Math.random() * 7));
      }
      const opts = Array.from(optsSet).sort((a, b) => a - b);
      const correctIndex = opts.indexOf(correctCount);

      return {
        prompt:
          lang === 'vi'
            ? `Số electron độc thân ở trạng thái cơ bản của ${tc.label} là bao nhiêu?`
            : `How many unpaired electrons are there in the ground state of ${tc.label}?`,
        options: opts.map(String),
        correctIndex,
        explanation:
          lang === 'vi'
            ? `${tc.label} có cấu hình ${res.result?.shortString}. Theo quy tắc Hund và sơ đồ orbital, có ${correctCount} electron độc thân (${res.result?.magneticProperty}).`
            : `${tc.label} has configuration ${res.result?.shortString} with ${correctCount} unpaired electrons.`,
      };
    } else if (questionType === 2) {
      // Type 2: Which element is an Aufbau exception?
      const exceptionZs = Object.keys(HARDCODED_EXCEPTIONS).map(Number);
      const chosenExceptionZ = exceptionZs[Math.floor(Math.random() * exceptionZs.length)];
      const exEl = ELEMENTS[chosenExceptionZ - 1];

      // Non-exception elements
      const normalElements = ELEMENTS.filter((e) => !HARDCODED_EXCEPTIONS[e.z] && e.z <= 30);
      const distractors: ElementData[] = [];
      while (distractors.length < 3) {
        const rand = normalElements[Math.floor(Math.random() * normalElements.length)];
        if (!distractors.includes(rand)) {
          distractors.push(rand);
        }
      }

      const all = [...distractors];
      const correctIndex = Math.floor(Math.random() * 4);
      all.splice(correctIndex, 0, exEl);

      return {
        prompt:
          lang === 'vi'
            ? 'Nguyên tố nào sau đây có cấu hình electron ngoại lệ so với quy tắc Madelung?'
            : 'Which of the following elements has an anomalous ground-state electron configuration?',
        options: all.map((el) => `${el.symbol} (Z = ${el.z}) - ${lang === 'vi' ? el.nameVi : el.nameEn}`),
        correctIndex,
        explanation:
          lang === 'vi'
            ? `${exEl.symbol} (Z = ${exEl.z}) có cấu hình thực nghiệm là ${
                calculateElement(exEl.z).result?.shortString
              }. ${HARDCODED_EXCEPTIONS[chosenExceptionZ]?.explanation || ''}`
            : `${exEl.symbol} is an experimental exception with configuration ${
                calculateElement(exEl.z).result?.shortString
              }.`,
      };
    } else {
      // Type 3: Valence electrons count
      const testZ = Math.floor(Math.random() * 20) + 1; // 1 to 20
      const el = ELEMENTS[testZ - 1];
      const res = calculateElement(el.z);
      const correctValence = res.result?.valenceElectrons ?? 1;

      const optsSet = new Set<number>([correctValence]);
      while (optsSet.size < 4) {
        optsSet.add(Math.floor(Math.random() * 8) + 1);
      }
      const opts = Array.from(optsSet).sort((a, b) => a - b);
      const correctIndex = opts.indexOf(correctValence);

      return {
        prompt:
          lang === 'vi'
            ? `Số electron hóa trị của nguyên tố ${el.nameVi} (${el.symbol}, nhóm ${el.group}) là bao nhiêu?`
            : `How many valence electrons does ${el.nameEn} (${el.symbol}) have?`,
        options: opts.map(String),
        correctIndex,
        explanation:
          lang === 'vi'
            ? `${el.nameVi} (${el.symbol}) có cấu hình ${res.result?.shortString}. ${res.result?.valenceExplanation}`
            : `${el.nameEn} has ${correctValence} valence electrons.`,
      };
    }
  };

  useEffect(() => {
    if (isOpen && !currentQuestion) {
      setCurrentQuestion(generateRandomQuestion());
    }
  }, [isOpen]);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    setTotalAnswered((prev) => prev + 1);
    if (index === currentQuestion?.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestion(generateRandomQuestion());
  };

  const handleReset = () => {
    setScore(0);
    setTotalAnswered(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestion(generateRandomQuestion());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Trắc nghiệm cấu hình electron"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'vi' ? 'Trắc nghiệm Cấu hình Electron' : 'Electron Configuration Quiz'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Luyện tập và kiểm tra kiến thức Hóa học' : 'Practice Chemistry knowledge'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bài trắc nghiệm"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score tracker */}
        <div className="px-5 py-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>
            {lang === 'vi' ? 'Điểm số:' : 'Score:'}{' '}
            <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">
              {score}
            </strong>
            /{totalAnswered}
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Làm lại từ đầu' : 'Reset score'}</span>
          </button>
        </div>

        {/* Question body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {currentQuestion && (
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => {
                  let btnStyle =
                    'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

                  if (isAnswered) {
                    if (idx === currentQuestion.correctIndex) {
                      btnStyle =
                        'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500';
                    } else if (idx === selectedAnswer) {
                      btnStyle =
                        'border-red-500 bg-red-500/15 text-red-700 dark:text-red-300 font-semibold ring-1 ring-red-500';
                    } else {
                      btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 text-left rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span className="font-mono">{opt}</span>
                      {isAnswered && idx === currentQuestion.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {isAnswered && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation card after answering */}
              {isAnswered && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border animate-fade-in ${
                    selectedAnswer === currentQuestion.correctIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {selectedAnswer === currentQuestion.correctIndex
                      ? (lang === 'vi' ? '🎉 Chính xác!' : '🎉 Correct!')
                      : (lang === 'vi' ? '❌ Chưa chính xác!' : '❌ Incorrect!')}
                  </p>
                  <p className="text-xs opacity-90">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          {isAnswered ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              {lang === 'vi' ? 'Câu tiếp theo →' : 'Next Question →'}
            </button>
          ) : (
            <span className="text-xs text-slate-400 self-center">
              {lang === 'vi' ? 'Hãy chọn một phương án' : 'Please select an option'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
