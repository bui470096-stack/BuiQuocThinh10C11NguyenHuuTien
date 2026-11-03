import { ELEMENTS, ElementData } from '../data/elements';

export interface SubshellDef {
  n: number;
  type: 's' | 'p' | 'd' | 'f';
  l: number;
  capacity: number;
  name: string; // e.g. "1s", "3d"
}

export interface SubshellConfig {
  subshell: SubshellDef;
  count: number;
}

export interface Orbital {
  id: string; // e.g. "3d_-2"
  m: number; // magnetic quantum number -l..+l
  electrons: number; // 0, 1, 2
  spinUp: boolean;
  spinDown: boolean;
}

export interface OrbitalGroup {
  subshellName: string;
  n: number;
  l: number;
  type: 's' | 'p' | 'd' | 'f';
  count: number;
  capacity: number;
  orbitals: Orbital[];
}

export interface QuantumNumbers {
  n: number;
  l: number;
  m: number;
  s: string; // "+1/2" or "-1/2"
}

export interface ExceptionInfo {
  isException: boolean;
  madelungConfigStr: string;
  actualConfigStr: string;
  explanation: string;
}

export interface CalculationResult {
  element: ElementData;
  charge: number;
  ionFormula: string; // e.g. "Fe³⁺" or "Fe"
  isIon: boolean;
  totalElectrons: number;
  neutralElectrons: number;
  protons: number;
  neutrons: number;
  massNumber: number;
  energyConfig: SubshellConfig[];
  shellConfig: SubshellConfig[];
  fullEnergyString: string;
  fullShellString: string;
  shortString: string;
  shortNote?: string;
  isPredicted: boolean; // Z > 103
  orbitalDiagram: OrbitalGroup[];
  shellElectrons: { name: string; n: number; count: number }[]; // K, L, M, N, O, P, Q
  shellString: string; // e.g. "2, 8, 14, 2"
  subshellCounts: { s: number; p: number; d: number; f: number };
  unpairedCount: number;
  magneticProperty: 'Thuận từ (Paramagnetic)' | 'Nghịch từ (Diamagnetic)';
  magneticDescription: string;
  valenceElectrons: number;
  valenceExplanation: string;
  lastQuantumNumbers?: QuantumNumbers;
  exceptionInfo?: ExceptionInfo;
  isoelectronicWith?: string;
  aufbauSteps: string[];
}

// Unicode superscripts
export const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};

export function toSuperscript(num: number | string): string {
  return String(num)
    .split('')
    .map((ch) => SUPERSCRIPT_MAP[ch] || ch)
    .join('');
}

// Standard Madelung order: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p
export const MADELUNG_ORDER: SubshellDef[] = [
  { n: 1, type: 's', l: 0, capacity: 2, name: '1s' },
  { n: 2, type: 's', l: 0, capacity: 2, name: '2s' },
  { n: 2, type: 'p', l: 1, capacity: 6, name: '2p' },
  { n: 3, type: 's', l: 0, capacity: 2, name: '3s' },
  { n: 3, type: 'p', l: 1, capacity: 6, name: '3p' },
  { n: 4, type: 's', l: 0, capacity: 2, name: '4s' },
  { n: 3, type: 'd', l: 2, capacity: 10, name: '3d' },
  { n: 4, type: 'p', l: 1, capacity: 6, name: '4p' },
  { n: 5, type: 's', l: 0, capacity: 2, name: '5s' },
  { n: 4, type: 'd', l: 2, capacity: 10, name: '4d' },
  { n: 5, type: 'p', l: 1, capacity: 6, name: '5p' },
  { n: 6, type: 's', l: 0, capacity: 2, name: '6s' },
  { n: 4, type: 'f', l: 3, capacity: 14, name: '4f' },
  { n: 5, type: 'd', l: 2, capacity: 10, name: '5d' },
  { n: 6, type: 'p', l: 1, capacity: 6, name: '6p' },
  { n: 7, type: 's', l: 0, capacity: 2, name: '7s' },
  { n: 5, type: 'f', l: 3, capacity: 14, name: '5f' },
  { n: 6, type: 'd', l: 2, capacity: 10, name: '6d' },
  { n: 7, type: 'p', l: 1, capacity: 6, name: '7p' },
];

export const NOBLE_GASES = [
  { z: 2, symbol: 'He', name: 'Heli' },
  { z: 10, symbol: 'Ne', name: 'Neon' },
  { z: 18, symbol: 'Ar', name: 'Agon' },
  { z: 36, symbol: 'Kr', name: 'Kripton' },
  { z: 54, symbol: 'Xe', name: 'Xenon' },
  { z: 86, symbol: 'Rn', name: 'Radon' },
  { z: 118, symbol: 'Og', name: 'Oganesson' },
];

// NIST / IUPAC ground state experimental exceptions overrides (mapping subshell counts)
// Each record overrides specific subshell counts for that element
export const HARDCODED_EXCEPTIONS: Record<
  number,
  {
    overrides: Record<string, number>;
    explanation: string;
  }
> = {
  24: {
    // Cr: [Ar] 3d5 4s1 (instead of 3d4 4s2)
    overrides: { '3d': 5, '4s': 1 },
    explanation:
      'Hiện tượng chuyển 1 electron từ phân lớp 4s sang 3d để đạt cấu hình bán bão hòa 3d⁵ bền vững hơn về mặt năng lượng trao đổi (exchange energy).',
  },
  29: {
    // Cu: [Ar] 3d10 4s1 (instead of 3d9 4s2)
    overrides: { '3d': 10, '4s': 1 },
    explanation:
      'Hiện tượng chuyển 1 electron từ 4s sang 3d để đạt cấu hình bão hòa 3d¹⁰ hoàn toàn đối xứng và bền vững hơn rất nhiều.',
  },
  41: {
    // Nb: [Kr] 4d4 5s1 (instead of 4d3 5s2)
    overrides: { '4d': 4, '5s': 1 },
    explanation:
      'Chuyển 1 electron từ 5s sang 4d do mức năng lượng 4d và 5s rất sát nhau, giảm lực đẩy tĩnh điện giữa các electron trong orbital 5s.',
  },
  42: {
    // Mo: [Kr] 4d5 5s1 (instead of 4d4 5s2)
    overrides: { '4d': 5, '5s': 1 },
    explanation:
      'Tương tự Cr, 1 electron chuyển từ 5s sang 4d để đạt cấu hình bán bão hòa 4d⁵ đối xứng cầu bền vững.',
  },
  44: {
    // Ru: [Kr] 4d7 5s1 (instead of 4d6 5s2)
    overrides: { '4d': 7, '5s': 1 },
    explanation:
      'Do mức năng lượng 4d và 5s rất gần nhau, cấu hình [Kr] 4d⁷ 5s¹ tối ưu hóa năng lượng trao đổi electron.',
  },
  45: {
    // Rh: [Kr] 4d8 5s1 (instead of 4d7 5s2)
    overrides: { '4d': 8, '5s': 1 },
    explanation:
      '1 electron chuyển từ 5s sang 4d tạo cấu hình [Kr] 4d⁸ 5s¹ bền hơn theo thực nghiệm phổ quang học.',
  },
  46: {
    // Pd: [Kr] 4d10 5s0 (instead of 4d8 5s2)
    overrides: { '4d': 10, '5s': 0 },
    explanation:
      'Cả 2 electron 5s chuyển hoàn toàn vào phân lớp 4d để đạt trạng thái bão hòa hoàn chỉnh 4d¹⁰ (lớp vỏ kín).',
  },
  47: {
    // Ag: [Kr] 4d10 5s1 (instead of 4d9 5s2)
    overrides: { '4d': 10, '5s': 1 },
    explanation:
      'Tương tự Cu, 1 electron 5s chuyển vào 4d để đạt cấu hình bão hòa 4d¹⁰ bền vững.',
  },
  57: {
    // La: [Xe] 5d1 6s2 (instead of 4f1 6s2)
    overrides: { '4f': 0, '5d': 1, '6s': 2 },
    explanation:
      'Electron điền vào orbital 5d trước 4f do hiệu ứng chắn hạt nhân ở đầu dãy Lantan làm mức năng lượng 5d thấp hơn 4f.',
  },
  58: {
    // Ce: [Xe] 4f1 5d1 6s2 (instead of 4f2 6s2)
    overrides: { '4f': 1, '5d': 1, '6s': 2 },
    explanation:
      'Cấu hình thực nghiệm [Xe] 4f¹ 5d¹ 6s² do năng lượng phân lớp 4f và 5d gần như suy biến ở nguyên tố Xeri.',
  },
  64: {
    // Gd: [Xe] 4f7 5d1 6s2 (instead of 4f8 6s2)
    overrides: { '4f': 7, '5d': 1, '6s': 2 },
    explanation:
      'Phân lớp 4f giữ cấu hình bán bão hòa 4f⁷ cực kỳ bền vững, electron tiếp theo được đặt vào orbital 5d.',
  },
  78: {
    // Pt: [Xe] 4f14 5d9 6s1 (instead of 5d8 6s2)
    overrides: { '5d': 9, '6s': 1 },
    explanation:
      'Hiệu ứng tương đối tính (relativistic effect) kết hợp năng lượng orbital 5d/6s làm cấu hình [Xe] 4f¹⁴ 5d⁹ 6s¹ có năng lượng thấp nhất.',
  },
  79: {
    // Au: [Xe] 4f14 5d10 6s1 (instead of 5d9 6s2)
    overrides: { '5d': 10, '6s': 1 },
    explanation:
      'Chuyển 1 electron từ 6s sang 5d để đạt bão hòa 5d¹⁰, cộng thêm hiệu ứng co cụm tương đối tính của orbital 6s.',
  },
  89: {
    // Ac: [Rn] 6d1 7s2 (instead of 5f1 7s2)
    overrides: { '5f': 0, '6d': 1, '7s': 2 },
    explanation:
      'Ở đầu dãy Actini, orbital 6d có năng lượng thấp hơn một chút so với 5f, electron điền vào 6d trước.',
  },
  90: {
    // Th: [Rn] 6d2 7s2 (instead of 5f2 7s2)
    overrides: { '5f': 0, '6d': 2, '7s': 2 },
    explanation:
      'Thori không có electron trên phân lớp 5f ở trạng thái cơ bản, cả 2 electron hóa trị đều nằm ở 6d.',
  },
  91: {
    // Pa: [Rn] 5f2 6d1 7s2 (instead of 5f3 7s2)
    overrides: { '5f': 2, '6d': 1, '7s': 2 },
    explanation:
      'Sự cạnh tranh năng lượng giữa 5f và 6d tạo ra cấu hình hỗn hợp 5f² 6d¹ 7s² bền nhất.',
  },
  92: {
    // U: [Rn] 5f3 6d1 7s2 (instead of 5f4 7s2)
    overrides: { '5f': 3, '6d': 1, '7s': 2 },
    explanation:
      'Urani duy trì 1 electron trên orbital 6d để giảm sức ép đẩy electron trong phân lớp 5f.',
  },
  93: {
    // Np: [Rn] 5f4 6d1 7s2 (instead of 5f5 7s2)
    overrides: { '5f': 4, '6d': 1, '7s': 2 },
    explanation:
      'Tương tự U, Neptuni giữ 1 electron ở 6d trong cấu hình trạng thái cơ bản thực nghiệm.',
  },
  96: {
    // Cm: [Rn] 5f7 6d1 7s2 (instead of 5f8 7s2)
    overrides: { '5f': 7, '6d': 1, '7s': 2 },
    explanation:
      'Tương tự Gd, Curi duy trì phân lớp 5f bán bão hòa 5f⁷ đối xứng bền vững, 1 electron chuyển sang 6d.',
  },
  103: {
    // Lr: [Rn] 5f14 7s2 7p1 (instead of 6d1 7s2)
    overrides: { '5f': 14, '6d': 0, '7s': 2, '7p': 1 },
    explanation:
      'Do hiệu ứng tương đối tính rất mạnh làm phân lớp 7p₁/₂ co lại và hạ thấp mức năng lượng xuống dưới 6d.',
  },
};

/**
 * Remove Vietnamese accents for loose matching
 */
export function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Parse input string for element identifier and optional ion charge
 * Supports:
 * - "Fe", "fe", "FE"
 * - "26"
 * - "Sắt", "sat", "Iron", "iron"
 * - "Fe3+", "Fe 3+", "Fe+3", "Fe^+3", "Fe^3+", "Fe2+", "Cl-", "Cl^-", "Cl1-", "Cl-1", "O2-", "O^-2", "Na+", "H+"
 */
export function parseInput(input: string): {
  cleanQuery: string;
  detectedCharge: number;
  rawInput: string;
  hasChargeInInput: boolean;
  error?: string;
} {
  const raw = (input || '').trim();
  if (!raw) {
    return {
      cleanQuery: '',
      detectedCharge: 0,
      rawInput: raw,
      hasChargeInInput: false,
      error: 'Vui lòng nhập ký hiệu, số hiệu Z hoặc tên nguyên tố.',
    };
  }

  // Regex to detect ion charge at the end or in caret format
  // Matches: Fe3+, Fe+3, Fe^3+, Fe^+3, Fe 3+, Cl-, Cl1-, Cl-1, O2-, O^-2, Cu2+, Cu++
  // Also matches simple charges like +, -, 2+, 3-, etc.
  let cleanQuery = raw;
  let detectedCharge = 0;
  let hasChargeInInput = false;

  const ionPattern = /([a-zA-ZÀ-ỹ\s]+|\d+)(?:\^)?\s*([+-]?\d+|[+-]+|\d+[+-])$/;
  const match = raw.match(ionPattern);

  if (match && match[2]) {
    const mainPart = match[1].trim();
    const chargePart = match[2].trim();

    // Verify if chargePart is really a charge and not part of name or Z
    if (chargePart === '+' || chargePart === '++' || chargePart === '+++') {
      detectedCharge = chargePart.length;
      cleanQuery = mainPart;
      hasChargeInInput = true;
    } else if (chargePart === '-' || chargePart === '--' || chargePart === '---') {
      detectedCharge = -chargePart.length;
      cleanQuery = mainPart;
      hasChargeInInput = true;
    } else if (/^\d+[+-]$/.test(chargePart)) {
      // e.g. "3+" or "2-"
      const sign = chargePart.endsWith('+') ? 1 : -1;
      const num = parseInt(chargePart.slice(0, -1), 10);
      detectedCharge = sign * num;
      cleanQuery = mainPart;
      hasChargeInInput = true;
    } else if (/^[+-]\d+$/.test(chargePart)) {
      // e.g. "+3" or "-2"
      detectedCharge = parseInt(chargePart, 10);
      cleanQuery = mainPart;
      hasChargeInInput = true;
    }
  }

  // Sanity check: if cleanQuery is empty, fallback to raw
  if (!cleanQuery) {
    cleanQuery = raw;
    detectedCharge = 0;
    hasChargeInInput = false;
  }

  return {
    cleanQuery,
    detectedCharge,
    rawInput: raw,
    hasChargeInInput,
  };
}

/**
 * Find element by Z, symbol, Vietnamese name, or English name
 */
export function getElement(identifier: string | number): ElementData | null {
  if (typeof identifier === 'number') {
    if (identifier >= 1 && identifier <= 118) {
      return ELEMENTS[identifier - 1] || null;
    }
    return null;
  }

  const trimmed = identifier.trim();
  if (!trimmed) return null;

  // Check if it's a numeric string (Z)
  if (/^\d+$/.test(trimmed)) {
    const z = parseInt(trimmed, 10);
    if (z >= 1 && z <= 118) {
      return ELEMENTS[z - 1] || null;
    }
    return null;
  }

  const lowerQuery = trimmed.toLowerCase();
  const normalizedQuery = removeAccents(trimmed);

  // 1. Exact symbol match (case-insensitive)
  const bySymbol = ELEMENTS.find((el) => el.symbol.toLowerCase() === lowerQuery);
  if (bySymbol) return bySymbol;

  // 2. Exact Vietnamese name match (with or without accents)
  const byNameVi = ELEMENTS.find(
    (el) =>
      el.nameVi.toLowerCase() === lowerQuery ||
      removeAccents(el.nameVi) === normalizedQuery
  );
  if (byNameVi) return byNameVi;

  // 3. Exact English name match
  const byNameEn = ELEMENTS.find(
    (el) => el.nameEn.toLowerCase() === lowerQuery
  );
  if (byNameEn) return byNameEn;

  // 4. Prefix or substring matching fallback
  const byPrefixVi = ELEMENTS.find((el) =>
    removeAccents(el.nameVi).startsWith(normalizedQuery)
  );
  if (byPrefixVi) return byPrefixVi;

  const byPrefixEn = ELEMENTS.find((el) =>
    el.nameEn.toLowerCase().startsWith(lowerQuery)
  );
  if (byPrefixEn) return byPrefixEn;

  return null;
}

/**
 * Build ground state configuration according to the Madelung rule
 */
export function buildConfiguration(z: number): SubshellConfig[] {
  let remaining = z;
  const config: SubshellConfig[] = [];

  for (const sub of MADELUNG_ORDER) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, sub.capacity);
    config.push({
      subshell: sub,
      count,
    });
    remaining -= count;
  }

  return config;
}

/**
 * Apply NIST/IUPAC experimental exceptions to neutral atom configuration
 */
export function applyExceptions(
  z: number,
  madelungConfig: SubshellConfig[]
): {
  config: SubshellConfig[];
  exceptionInfo?: ExceptionInfo;
} {
  const exception = HARDCODED_EXCEPTIONS[z];
  if (!exception) {
    return { config: madelungConfig };
  }

  // Clone config
  const modified: SubshellConfig[] = madelungConfig.map((item) => ({
    subshell: item.subshell,
    count: item.count,
  }));

  // Apply overrides
  for (const [subshellName, count] of Object.entries(exception.overrides)) {
    const existing = modified.find((item) => item.subshell.name === subshellName);
    if (existing) {
      existing.count = count;
    } else if (count > 0) {
      // Find definition from MADELUNG_ORDER
      const def = MADELUNG_ORDER.find((d) => d.name === subshellName);
      if (def) {
        modified.push({
          subshell: def,
          count,
        });
      }
    }
  }

  // Filter out subshells with 0 electrons
  const finalConfig = modified.filter((item) => item.count > 0);

  // Stringify configs for comparison
  const madelungStr = formatConfigString(madelungConfig, false);
  const actualStr = formatConfigString(finalConfig, false);

  return {
    config: finalConfig,
    exceptionInfo: {
      isException: true,
      madelungConfigStr: madelungStr,
      actualConfigStr: actualStr,
      explanation: exception.explanation,
    },
  };
}

/**
 * Format configuration list to string with Unicode superscripts
 * sortByShell: if true, order by n ascending, then l
 */
export function formatConfigString(
  config: SubshellConfig[],
  sortByShell = false
): string {
  const list = [...config].filter((item) => item.count > 0);
  if (sortByShell) {
    list.sort((a, b) => {
      if (a.subshell.n !== b.subshell.n) {
        return a.subshell.n - b.subshell.n;
      }
      return a.subshell.l - b.subshell.l;
    });
  }

  return list
    .map((item) => `${item.subshell.name}${toSuperscript(item.count)}`)
    .join(' ');
}

/**
 * Shorten configuration using closest noble gas with Z_gas <= totalElectrons
 */
export function shortenConfig(
  config: SubshellConfig[],
  totalElectrons: number
): { shortString: string; nobleGas?: (typeof NOBLE_GASES)[0]; note?: string } {
  // If H or totalElectrons < 2
  if (totalElectrons === 1) {
    return {
      shortString: formatConfigString(config, true),
      note: 'Hiđro (H) không có khí hiếm đứng trước nên viết cấu hình đầy đủ: 1s¹.',
    };
  }
  if (totalElectrons === 2) {
    return {
      shortString: '1s²',
      nobleGas: NOBLE_GASES[0],
      note: 'Heli (He) là khí hiếm chu kỳ 1 với 2 electron, cấu hình là 1s².',
    };
  }

  // Find closest noble gas with Z_gas <= totalElectrons
  // Noble gases in descending order
  const eligible = [...NOBLE_GASES].reverse().find((g) => g.z <= totalElectrons);
  if (!eligible) {
    return {
      shortString: formatConfigString(config, true),
    };
  }

  // If the element/ion has exactly noble gas electrons
  if (eligible.z === totalElectrons) {
    return {
      shortString: `[${eligible.symbol}]`,
      nobleGas: eligible,
      note: `Có cấu hình bão hòa bền vững giống khí hiếm [${eligible.symbol}] (${eligible.z}e).`,
    };
  }

  // Otherwise, get the Aufbau config of that noble gas and subtract counts
  const nobleGasConfig = buildConfiguration(eligible.z);
  const nobleGasCounts: Record<string, number> = {};
  for (const item of nobleGasConfig) {
    nobleGasCounts[item.subshell.name] = item.count;
  }

  // Sort remainder by shell (n, then l)
  const remainder: SubshellConfig[] = [];
  for (const item of config) {
    const ngCount = nobleGasCounts[item.subshell.name] || 0;
    const diff = item.count - ngCount;
    if (diff > 0) {
      remainder.push({
        subshell: item.subshell,
        count: diff,
      });
    }
  }

  remainder.sort((a, b) => {
    if (a.subshell.n !== b.subshell.n) {
      return a.subshell.n - b.subshell.n;
    }
    return a.subshell.l - b.subshell.l;
  });

  const remainderStr = remainder
    .map((item) => `${item.subshell.name}${toSuperscript(item.count)}`)
    .join(' ');

  return {
    shortString: `[${eligible.symbol}] ${remainderStr}`.trim(),
    nobleGas: eligible,
  };
}

/**
 * Apply ion charge to neutral configuration:
 * - Cation (charge > 0): remove electrons from highest n first, then highest l within same n.
 *   For transition metals, ns is removed before (n-1)d.
 *   For f-block, ns is removed, then (n-1)d, then (n-2)f.
 * - Anion (charge < 0): add electrons following Madelung order.
 */
export function applyIon(
  neutralConfig: SubshellConfig[],
  charge: number,
  elementZ: number
): {
  config: SubshellConfig[];
  totalElectrons: number;
  error?: string;
  isoelectronicWith?: string;
} {
  const totalElectrons = elementZ - charge;

  if (totalElectrons <= 0) {
    return {
      config: [],
      totalElectrons,
      error: `Điện tích +${charge} không hợp lệ! Nguyên tố ${
        ELEMENTS[elementZ - 1]?.symbol || elementZ
      } chỉ có ${elementZ} electron. Không thể tách hết hoặc nhiều hơn số electron hiện có.`,
    };
  }

  if (charge === 0) {
    return {
      config: neutralConfig,
      totalElectrons,
    };
  }

  // Deep clone
  const currentConfig: SubshellConfig[] = neutralConfig.map((item) => ({
    subshell: item.subshell,
    count: item.count,
  }));

  if (charge > 0) {
    // Remove `charge` electrons
    let toRemove = charge;

    while (toRemove > 0) {
      // Find subshells with count > 0
      const active = currentConfig.filter((item) => item.count > 0);
      if (active.length === 0) break;

      // Rule: highest n first. If tie in n, highest l first.
      active.sort((a, b) => {
        if (a.subshell.n !== b.subshell.n) {
          return b.subshell.n - a.subshell.n; // largest n first
        }
        return b.subshell.l - a.subshell.l; // largest l first (p before s, d before p, f before d)
      });

      const target = active[0];
      const removeCount = Math.min(toRemove, target.count);
      target.count -= removeCount;
      toRemove -= removeCount;
    }
  } else {
    // Anion (charge < 0): add |charge| electrons following Madelung filling order
    let toAdd = Math.abs(charge);

    for (const sub of MADELUNG_ORDER) {
      if (toAdd <= 0) break;

      let existing = currentConfig.find((item) => item.subshell.name === sub.name);
      if (!existing) {
        existing = { subshell: sub, count: 0 };
        currentConfig.push(existing);
      }

      const available = sub.capacity - existing.count;
      if (available > 0) {
        const addCount = Math.min(toAdd, available);
        existing.count += addCount;
        toAdd -= addCount;
      }
    }
  }

  // Filter out empty subshells
  const finalConfig = currentConfig.filter((item) => item.count > 0);

  // Check if isoelectronic with a noble gas
  const nobleMatch = NOBLE_GASES.find((g) => g.z === totalElectrons);
  let isoelectronicWith: string | undefined;
  if (nobleMatch) {
    isoelectronicWith = `Đẳng electron với khí hiếm ${nobleMatch.name} ([${nobleMatch.symbol}], ${nobleMatch.z}e).`;
  }

  return {
    config: finalConfig,
    totalElectrons,
    isoelectronicWith,
  };
}

/**
 * Build orbital diagram obeying Hund's rule and Pauli exclusion principle
 */
export function buildOrbitalDiagram(config: SubshellConfig[]): OrbitalGroup[] {
  const groups: OrbitalGroup[] = [];

  for (const item of config) {
    const { subshell, count } = item;
    const numOrbitals = 2 * subshell.l + 1; // s=1, p=3, d=5, f=7
    const orbitals: Orbital[] = [];

    // Initialize orbitals with m quantum numbers: -l to +l
    for (let m = -subshell.l; m <= subshell.l; m++) {
      orbitals.push({
        id: `${subshell.name}_${m}`,
        m,
        electrons: 0,
        spinUp: false,
        spinDown: false,
      });
    }

    // Apply Hund's rule:
    // Pass 1: distribute spinUp (↑) across all orbitals
    for (let i = 0; i < numOrbitals && i < count; i++) {
      orbitals[i].electrons += 1;
      orbitals[i].spinUp = true;
    }

    // Pass 2: if count > numOrbitals, pair up with spinDown (↓)
    if (count > numOrbitals) {
      const remaining = count - numOrbitals;
      for (let i = 0; i < remaining && i < numOrbitals; i++) {
        orbitals[i].electrons += 1;
        orbitals[i].spinDown = true;
      }
    }

    groups.push({
      subshellName: subshell.name,
      n: subshell.n,
      l: subshell.l,
      type: subshell.type,
      count,
      capacity: subshell.capacity,
      orbitals,
    });
  }

  return groups;
}

/**
 * Count electrons in each main shell K, L, M, N, O, P, Q (n = 1..7)
 */
export function countShellElectrons(config: SubshellConfig[]): {
  shells: { name: string; n: number; count: number }[];
  shortString: string;
} {
  const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  for (const item of config) {
    if (item.subshell.n >= 1 && item.subshell.n <= 7) {
      counts[item.subshell.n - 1] += item.count;
    }
  }

  // Find highest filled shell
  let maxN = 0;
  for (let i = counts.length - 1; i >= 0; i--) {
    if (counts[i] > 0) {
      maxN = i + 1;
      break;
    }
  }

  const shells = SHELL_NAMES.slice(0, maxN).map((name, index) => ({
    name,
    n: index + 1,
    count: counts[index],
  }));

  const shortString = shells.map((s) => s.count).join(', ');

  return { shells, shortString };
}

/**
 * Count electrons per subshell type: s, p, d, f
 */
export function countSubshellElectrons(config: SubshellConfig[]): {
  s: number;
  p: number;
  d: number;
  f: number;
} {
  const counts = { s: 0, p: 0, d: 0, f: 0 };
  for (const item of config) {
    counts[item.subshell.type] += item.count;
  }
  return counts;
}

/**
 * Count unpaired electrons from the orbital diagram
 */
export function countUnpaired(diagram: OrbitalGroup[]): number {
  let unpaired = 0;
  for (const group of diagram) {
    for (const orb of group.orbitals) {
      if (orb.electrons === 1) {
        unpaired++;
      }
    }
  }
  return unpaired;
}

/**
 * Calculate valence electrons and provide detailed pedagogical explanation
 */
export function getValenceElectrons(
  element: ElementData,
  config: SubshellConfig[]
): {
  count: number;
  explanation: string;
} {
  // If noble gas (except He)
  if (element.category === 'noble') {
    if (element.z === 2) {
      return {
        count: 2,
        explanation:
          'Heli (He) có 2 electron trên lớp ngoài cùng (1s²), cấu hình bão hòa hoàn chỉnh (cặp electron độc thân = 0).',
      };
    }
    return {
      count: 8,
      explanation:
        'Khí hiếm có 8 electron lớp ngoài cùng (ns² np⁶), tạo thành bát tử bền vững (octet rule).',
    };
  }

  // Find outermost shell n_max
  let nMax = 1;
  for (const item of config) {
    if (item.subshell.n > nMax && item.count > 0) {
      nMax = item.subshell.n;
    }
  }

  // Group A (Main group: s and p blocks)
  if (element.block === 's' || element.block === 'p') {
    let valence = 0;
    for (const item of config) {
      if (item.subshell.n === nMax) {
        valence += item.count;
      }
    }
    return {
      count: valence,
      explanation: `Nhóm A: số electron hóa trị bằng số electron ở lớp ngoài cùng (n = ${nMax}), gồm các phân lớp ns và np (${valence}e).`,
    };
  }

  // Group B (Transition metals: d-block)
  if (element.block === 'd') {
    // ns electrons + (n-1)d electrons (if (n-1)d is not fully saturated, or count valence according to chemistry convention)
    const ns = config.find((item) => item.subshell.n === nMax && item.subshell.type === 's')?.count || 0;
    const nMinus1D = config.find((item) => item.subshell.n === nMax - 1 && item.subshell.type === 'd')?.count || 0;

    let valence = ns;
    if (nMinus1D < 10) {
      valence += nMinus1D;
      return {
        count: valence,
        explanation: `Kim loại chuyển tiếp (Nhóm B): electron hóa trị gồm electron phân lớp ngoài cùng ${nMax}s (${ns}e) và phân lớp sát ngoài cùng ${
          nMax - 1
        }d chưa bão hòa (${nMinus1D}e) → Tổng: ${valence}e hóa trị.`,
      };
    } else {
      return {
        count: ns,
        explanation: `Kim loại chuyển tiếp phân nhóm IIB/IB có phân lớp (${nMax - 1})d đã bão hòa hoàn toàn (d¹⁰), do đó chỉ có ${ns} electron ở phân lớp ${nMax}s tham gia hóa trị trong phản ứng thông thường.`,
      };
    }
  }

  // f-block (Lanthanides & Actinides)
  if (element.block === 'f') {
    const ns = config.find((item) => item.subshell.n === nMax && item.subshell.type === 's')?.count || 0;
    const nMinus1D = config.find((item) => item.subshell.n === nMax - 1 && item.subshell.type === 'd')?.count || 0;
    const nMinus2F = config.find((item) => item.subshell.n === nMax - 2 && item.subshell.type === 'f')?.count || 0;
    const total = ns + nMinus1D + nMinus2F;

    return {
      count: total,
      explanation: `Nguyên tố họ ${
        element.categoryVi
      }: electron hóa trị phân bố trên các phân lớp ${nMax}s (${ns}e), ${nMax - 1}d (${nMinus1D}e) và ${
        nMax - 2
      }f (${nMinus2F}e). Số oxi hóa phổ biến nhất thường là +3.`,
    };
  }

  return {
    count: 0,
    explanation: 'Số electron hóa trị được xác định từ các phân lớp ngoài cùng.',
  };
}

/**
 * Determine the 4 quantum numbers (n, l, m, s) of the very last electron added according to Aufbau/Hund
 */
export function getLastQuantumNumbers(
  config: SubshellConfig[],
  diagram: OrbitalGroup[]
): QuantumNumbers | undefined {
  if (config.length === 0 || diagram.length === 0) return undefined;

  // The last subshell in energy order with count > 0
  const lastGroup = diagram[diagram.length - 1];
  const { n, l, count, orbitals } = lastGroup;

  const numOrbitals = orbitals.length;
  let m = 0;
  let s = '+1/2';

  if (count <= numOrbitals) {
    // Single electron in orbital index (count - 1)
    const targetOrb = orbitals[count - 1];
    m = targetOrb.m;
    s = '+1/2';
  } else {
    // Paired electron in orbital index (count - numOrbitals - 1)
    const targetOrb = orbitals[count - numOrbitals - 1];
    m = targetOrb.m;
    s = '-1/2';
  }

  return { n, l, m, s };
}

/**
 * Generate Aufbau build-up steps explanation
 */
export function generateAufbauSteps(
  element: ElementData,
  totalElectrons: number,
  energyConfig: SubshellConfig[]
): string[] {
  const steps: string[] = [];

  steps.push(
    `Bước 1: Xác định tổng số electron cần phân bố: Z = ${element.z}, tổng electron = ${totalElectrons}.`
  );
  steps.push(
    'Bước 2: Điền electron theo mức năng lượng tăng dần (quy tắc Klechkovski / Madelung): 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p → 6s → 4f → 5d → 6p → 7s → 5f → 6d → 7p.'
  );

  const fillingProgression = energyConfig
    .map((item) => `${item.subshell.name}${toSuperscript(item.count)}`)
    .join(' ');
  steps.push(`Bước 3: Cấu hình theo thứ tự mức năng lượng: ${fillingProgression}.`);

  const shellProgression = formatConfigString(energyConfig, true);
  steps.push(
    `Bước 4: Sắp xếp lại theo từng lớp electron (n tăng dần): ${shellProgression}.`
  );

  return steps;
}

/**
 * Master calculation function
 */
export function calculateElement(
  identifier: string | number,
  charge = 0
): {
  success: boolean;
  result?: CalculationResult;
  error?: string;
} {
  // Check if identifier is a numeric string outside 1..118
  const trimmed = String(identifier).trim();
  if (/^-?\d+$/.test(trimmed)) {
    const zNum = parseInt(trimmed, 10);
    if (zNum < 1 || zNum > 118) {
      return {
        success: false,
        error: `Số hiệu nguyên tử Z phải từ 1 đến 118 (Bạn đã nhập Z = ${zNum}). Bảng tuần hoàn hiện đại có 118 nguyên tố hóa học.`,
      };
    }
  }

  const element = getElement(identifier);
  if (!element) {
    return {
      success: false,
      error: `Không tìm thấy nguyên tố "${identifier}". Hãy thử nhập ký hiệu hóa học như Fe hoặc số hiệu Z như 26.`,
    };
  }

  // 1. Build neutral Aufbau config
  const madelungConfig = buildConfiguration(element.z);

  // 2. Apply ground state exceptions (Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag, ...)
  const { config: neutralActualConfig, exceptionInfo } = applyExceptions(
    element.z,
    madelungConfig
  );

  // 3. Apply ion charge
  const {
    config: ionConfig,
    totalElectrons,
    error: ionError,
    isoelectronicWith,
  } = applyIon(neutralActualConfig, charge, element.z);

  if (ionError) {
    return {
      success: false,
      error: ionError,
    };
  }

  // 4. Formats
  const fullEnergyString = formatConfigString(ionConfig, false);
  const fullShellString = formatConfigString(ionConfig, true);
  const { shortString, note: shortNote } = shortenConfig(ionConfig, totalElectrons);

  // 5. Orbital diagram
  const orbitalDiagram = buildOrbitalDiagram(ionConfig);

  // 6. Shell & subshell counts
  const { shells: shellElectrons, shortString: shellString } = countShellElectrons(ionConfig);
  const subshellCounts = countSubshellElectrons(ionConfig);

  // 7. Unpaired & magnetism
  const unpairedCount = countUnpaired(orbitalDiagram);
  const magneticProperty =
    unpairedCount > 0 ? 'Thuận từ (Paramagnetic)' : 'Nghịch từ (Diamagnetic)';
  const magneticDescription =
    unpairedCount > 0
      ? `Có ${unpairedCount} electron độc thân trong các orbital nên chất này có tính thuận từ (bị từ trường ngoài hút yếu).`
      : 'Tất cả các orbital đều đã ghép đôi electron hoàn chỉnh nên chất này có tính nghịch từ (bị từ trường ngoài đẩy rất nhẹ).';

  // 8. Valence electrons
  const { count: valenceElectrons, explanation: valenceExplanation } = getValenceElectrons(
    element,
    ionConfig
  );

  // 9. Last quantum numbers
  const lastQuantumNumbers = getLastQuantumNumbers(ionConfig, orbitalDiagram);

  // 10. Aufbau steps
  const aufbauSteps = generateAufbauSteps(element, totalElectrons, ionConfig);

  // Ion formula
  let ionFormula = element.symbol;
  if (charge > 0) {
    ionFormula += charge === 1 ? '⁺' : `${toSuperscript(charge)}⁺`;
  } else if (charge < 0) {
    const abs = Math.abs(charge);
    ionFormula += abs === 1 ? '⁻' : `${toSuperscript(abs)}⁻`;
  }

  const protons = element.z;
  const massNumber = element.massNumber;
  const neutrons = Math.max(0, massNumber - protons);

  return {
    success: true,
    result: {
      element,
      charge,
      ionFormula,
      isIon: charge !== 0,
      totalElectrons,
      neutralElectrons: element.z,
      protons,
      neutrons,
      massNumber,
      energyConfig: ionConfig,
      shellConfig: [...ionConfig].sort((a, b) => {
        if (a.subshell.n !== b.subshell.n) return a.subshell.n - b.subshell.n;
        return a.subshell.l - b.subshell.l;
      }),
      fullEnergyString,
      fullShellString,
      shortString,
      shortNote,
      isPredicted: element.z > 103,
      orbitalDiagram,
      shellElectrons,
      shellString,
      subshellCounts,
      unpairedCount,
      magneticProperty,
      magneticDescription,
      valenceElectrons,
      valenceExplanation,
      lastQuantumNumbers,
      exceptionInfo,
      isoelectronicWith,
      aufbauSteps,
    },
  };
}
