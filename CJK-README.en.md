CJK (Man / Oku) Support — Design and Usage

Note: This document is a translation from the original Japanese version (CJK-README.ja.md).
=========================================

Purpose
-------
- Support East Asian locales (Japanese, Korean, Chinese) with common units such as "萬/ man" (10^4), "億/oku" (10^8), and "兆/cho" (10^12) for both formatting and unformatting.
- Preserve the existing short-scale behavior (thousand/million/billion/trillion) by default to maintain backward compatibility.

Design (Summary)
-----------------
- Add optional locale fields:
  - `abbreviationScheme`: string (e.g. "short-scale" (default), "cjk")
  - `abbreviationUnits`: mapping of unit keys to multipliers (numbers), e.g. `{ man:1e4, oku:1e8, cho:1e12 }`
  - `displayAbbreviations` (optional): mapping of unit keys to display strings, e.g. `{ man: "万", oku: "億", cho: "兆" }`

- Implementation overview: add getters to `globalState` so `formatting` and `unformatting` consult per-language `abbreviationUnits` and `displayAbbreviations`.
- If these fields are not provided, the library falls back to the default short-scale behavior, so existing behavior remains unchanged.

Locale example (adding to `languages/ja-JP.js`)
---------------------------------------------
Example to add:

```
abbreviationScheme: "cjk",
abbreviationUnits: {
  man: 1e4,
  oku: 1e8,
  cho: 1e12
},
displayAbbreviations: {
  man: "万",
  oku: "億",
  cho: "兆"
}
```

Important Notes
---------------
- Do not destructively change the existing `abbreviations` object (some external code may rely on those strings).
- The new fields are optional: if a locale does not provide them, the library uses the short-scale defaults.

Expected Behavior (Examples)
----------------------------
- When a locale sets the `cjk` scheme:
  - `1_200_000_000` should format to "12億" (division by 1e8 for the `oku` unit).
  - `unformat("12億")` should return `1200000000` (round-trip expected).

Migration Steps (Concise)
------------------------
1. Add new getters to `globalState` (e.g. `currentAbbreviationUnits()` / `currentDisplayAbbreviations()`).
2. Update `src/formatting.js` to choose abbreviations based on per-language `abbreviationUnits`.
3. Update `src/unformatting.js` to use the same mapping for reverse parsing.
4. Optionally add `abbreviationScheme` and `abbreviationUnits` / `displayAbbreviations` to locale files. If omitted, behavior stays the same.

Tests
-----
- Preserve existing tests to ensure default behavior is unchanged.
- Add unit tests for the `cjk` scheme (e.g. `numbro(1200000000) -> "12億"`, `unformat("12億") -> 1200000000`).

Testing Notes
-------------
- The repository's existing tests assume short-scale by default; permanently enabling CJK may change expected outputs and cause test conflicts.
- Recommended approach:
  - Provide a test helper to enable CJK only during tests (`tests/helpers/enableCjkForLanguage.js`).
  - If your project decides to enable CJK permanently, update the corresponding locale tests to match CJK expectations (examples updated in `tests/languages/ja-JP-tests.js` etc.).

Changes Applied (This Work)
--------------------------
- `src/unformatting.js`: extended unformat logic to recognize both legacy `abbreviations` and CJK `displayAbbreviations`.
- `languages/ja-JP.js`, `languages/ko-KR.js`, `languages/zh-CN.js`: added `abbreviationUnits` / `displayAbbreviations` and permanently set `ja-JP` to `abbreviationScheme: "cjk"`.
- `tests/helpers/enableCjkForLanguage.js`: added a test helper to enable CJK for a language object during tests.
- Updated multiple language tests (`tests/languages/*-tests.js`) to reflect CJK-enabled expectations where applicable.

Detailed Implementation Notes
----------------------------
- Keep `abbreviations` in locale files unchanged and add the new optional CJK fields.
- `src/unformatting.js` now merges legacy `abbreviations` with CJK `displayAbbreviations` for parsing, and matches tokens in "longest-first" order (to handle overlaps such as `百萬` vs `萬`).
- Provide a test helper to toggle CJK in tests so the repository's default short-scale tests remain unaffected.

Currency tokens (`currency.alternates`)
--------------------------------------
- Real-world inputs often use multiple tokens for the same currency (examples: `円` / `¥`, `港元` / `HK$`).
- The library supports an optional `currency.alternates` array in locale files. When unformatting, the code gathers `currency.symbol`, `currency.alternates`, and `currency.code`, sorts candidates by length (longest first) and removes them from the input before parsing the number. This prevents partial matches (e.g. `人民元` vs `元`).

Example (locale file):

```js
currency: {
  symbol: "元",
  alternates: ["人民元", "¥"],
  position: "postfix",
  code: "CNY"
}
```

Recommendations
---------------
- Keep `alternates` concise and language-appropriate to avoid accidental removals.
- Add representative `unformats correctly` test cases to `tests/languages/<tag>-tests.js` when you add alternates.
