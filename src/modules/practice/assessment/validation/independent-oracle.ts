/** Hand-derived from the displayed fixed prompts, without reading stored keys or
 * calling the route scorer. This is computational independence, not a second
 * human author or independent educational review. Not used to author the bank. */
export function independentAnswers(): Readonly<Record<string, number | null>> {
  const digits = Array.from({ length: 10 }, (_, i) => i);
  const whole = Array.from({ length: 1000 }, (_, i) => i);
  return {
    'E-F-P': Number(String(47)[0]),
    'E-F-C': 3 * 10 + 4 - 2 * 10,
    'E-F-A': Array.from({ length: 68 }).filter((_, i) => (i + 1) % 10 === 0)
      .length,
    'E-V-P': 406 - 400 - 6,
    'E-V-C': (520 - 400) / 10,
    'E-V-A': 100 + 100 + 100 + 10 + 10 + 7,
    'E-O-P': [...[608, 680, 806]].sort((a, b) => a - b)[0]!,
    'E-O-C': digits.find((d) => 400 + d * 10 + 2 > 472)!,
    'E-O-A': whole.find((n) => n > 398 && n < 400)!,
    'P-F-P': 73 - 3,
    'P-F-C': 26 - 10,
    'P-F-A': Math.trunc(52 / 10),
    'P-V-P': 900 + 9,
    'P-V-C': (630 - 500) / 10,
    'P-V-A': 8 * 100 + 9,
    'P-O-P': [...[99, 100, 90]].sort((a, b) => b - a)[0]!,
    'P-O-C': digits.filter((d) => 600 + d * 10 + 5 < 645).at(-1)!,
    'P-O-A': whole.find((n) => n > 699 && n < 701)!,
    'H-F-P': [10, 20, 30, 40, 50, 60].length,
    'H-F-C': null,
    'H-F-A': whole.find((boxes) => boxes * 10 >= 83)!,
    'H-V-P': Number(String(306).split('').reverse().join('')),
    'H-V-C': whole.filter((n) => n >= 400 && n < 500 && n % 10 === 0).length,
    'H-V-A': whole.find((n) => n > 625 && n < 627)!,
    'H-O-P': [572, 527, 257].sort((a, b) => a - b).indexOf(527) + 1,
    'H-O-C': whole.filter((n) => n < 500 && /^[49]+$/.test(String(n))).at(-1)!,
    'H-O-A': [205, 249, 251].find((n) => n > 250)!,
  };
}
