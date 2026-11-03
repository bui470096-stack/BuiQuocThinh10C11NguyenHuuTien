import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateElement,
  getElement,
  parseInput,
} from './electronConfig';
import { ELEMENTS } from '../data/elements';

test('H: 1s¹, 1 unpaired electron', () => {
  const res = calculateElement('H');
  assert.equal(res.success, true);
  assert.equal(res.result?.fullEnergyString, '1s¹');
  assert.equal(res.result?.unpairedCount, 1);
});

test('He: 1s², 0 unpaired electron', () => {
  const res = calculateElement('He');
  assert.equal(res.success, true);
  assert.equal(res.result?.fullEnergyString, '1s²');
  assert.equal(res.result?.unpairedCount, 0);
});

test('Na: [Ne] 3s¹, shells 2, 8, 1, 1 unpaired electron', () => {
  const res = calculateElement('Na');
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ne] 3s¹');
  assert.equal(res.result?.shellString, '2, 8, 1');
  assert.equal(res.result?.unpairedCount, 1);
});

test('Fe: [Ar] 3d⁶ 4s², shells 2, 8, 14, 2, 4 unpaired electrons', () => {
  const res = calculateElement('Fe');
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar] 3d⁶ 4s²');
  assert.equal(res.result?.shellString, '2, 8, 14, 2');
  assert.equal(res.result?.unpairedCount, 4);
});

test('Cr: [Ar] 3d⁵ 4s¹ (exception), shells 2, 8, 13, 1, 6 unpaired electrons', () => {
  const res = calculateElement('Cr');
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar] 3d⁵ 4s¹');
  assert.equal(res.result?.shellString, '2, 8, 13, 1');
  assert.equal(res.result?.unpairedCount, 6);
  assert.equal(res.result?.exceptionInfo?.isException, true);
});

test('Cu: [Ar] 3d¹⁰ 4s¹ (exception), shells 2, 8, 18, 1, 1 unpaired electron', () => {
  const res = calculateElement('Cu');
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar] 3d¹⁰ 4s¹');
  assert.equal(res.result?.shellString, '2, 8, 18, 1');
  assert.equal(res.result?.unpairedCount, 1);
  assert.equal(res.result?.exceptionInfo?.isException, true);
});

test('Fe²⁺: [Ar] 3d⁶, 4 unpaired electrons', () => {
  const res = calculateElement('Fe', 2);
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar] 3d⁶');
  assert.equal(res.result?.unpairedCount, 4);
  assert.equal(res.result?.totalElectrons, 24);
});

test('Fe³⁺: [Ar] 3d⁵, 5 unpaired electrons', () => {
  const res = calculateElement('Fe', 3);
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar] 3d⁵');
  assert.equal(res.result?.unpairedCount, 5);
  assert.equal(res.result?.totalElectrons, 23);
});

test('Cl⁻: [Ar], 0 unpaired electrons, isoelectronic with Ar', () => {
  const res = calculateElement('Cl', -1);
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar]');
  assert.equal(res.result?.unpairedCount, 0);
  assert.equal(res.result?.totalElectrons, 18);
  assert.match(res.result?.isoelectronicWith || '', /Agon|Ar/);
});

test('O²⁻: [Ne], 0 unpaired electrons, isoelectronic with Ne', () => {
  const res = calculateElement('O', -2);
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ne]');
  assert.equal(res.result?.unpairedCount, 0);
  assert.equal(res.result?.totalElectrons, 10);
  assert.match(res.result?.isoelectronicWith || '', /Neon|Ne/);
});

test('Cu²⁺: [Ar] 3d⁹, 1 unpaired electron', () => {
  const res = calculateElement('Cu', 2);
  assert.equal(res.success, true);
  assert.equal(res.result?.shortString, '[Ar] 3d⁹');
  assert.equal(res.result?.unpairedCount, 1);
  assert.equal(res.result?.totalElectrons, 27);
});

test('Z=118 (Og): predicted label, [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', () => {
  const res = calculateElement(118);
  assert.equal(res.success, true);
  assert.equal(res.result?.isPredicted, true);
  assert.equal(res.result?.element.symbol, 'Og');
  assert.equal(res.result?.shortString, '[Og]');
  assert.equal(
    res.result?.fullShellString,
    '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁶ 4d¹⁰ 4f¹⁴ 5s² 5p⁶ 5d¹⁰ 5f¹⁴ 6s² 6p⁶ 6d¹⁰ 7s² 7p⁶'
  );
});

test('Friendly error for unknown element', () => {
  const res = calculateElement('xyz');
  assert.equal(res.success, false);
  assert.match(res.error || '', /Không tìm thấy nguyên tố/);
});

test('Friendly error for Z=200 out of bounds', () => {
  const res = calculateElement('200');
  assert.equal(res.success, false);
  assert.match(res.error || '', /Z phải từ 1 đến 118/);
});

test('All 118 elements: total electrons across shells equals Z for neutral atom', () => {
  for (let z = 1; z <= 118; z++) {
    const res = calculateElement(z, 0);
    assert.equal(res.success, true, `Failed for Z = ${z}`);
    const shellTotal = res.result?.shellElectrons.reduce((acc, s) => acc + s.count, 0);
    assert.equal(shellTotal, z, `Shell sum mismatch for Z = ${z}`);
    const subshellTotal =
      (res.result?.subshellCounts.s || 0) +
      (res.result?.subshellCounts.p || 0) +
      (res.result?.subshellCounts.d || 0) +
      (res.result?.subshellCounts.f || 0);
    assert.equal(subshellTotal, z, `Subshell sum mismatch for Z = ${z}`);
  }
});

test('parseInput correctly parses ions and accents', () => {
  assert.deepEqual(parseInput('Fe3+'), {
    cleanQuery: 'Fe',
    detectedCharge: 3,
    rawInput: 'Fe3+',
    hasChargeInInput: true,
  });

  assert.deepEqual(parseInput('Fe^2+'), {
    cleanQuery: 'Fe',
    detectedCharge: 2,
    rawInput: 'Fe^2+',
    hasChargeInInput: true,
  });

  assert.deepEqual(parseInput('Cl-'), {
    cleanQuery: 'Cl',
    detectedCharge: -1,
    rawInput: 'Cl-',
    hasChargeInInput: true,
  });

  assert.deepEqual(parseInput('O2-'), {
    cleanQuery: 'O',
    detectedCharge: -2,
    rawInput: 'O2-',
    hasChargeInInput: true,
  });

  assert.deepEqual(parseInput('sắt'), {
    cleanQuery: 'sắt',
    detectedCharge: 0,
    rawInput: 'sắt',
    hasChargeInInput: false,
  });
});
