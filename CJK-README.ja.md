CJK（万・億）対応の設計と使い方
=================================

目的
----
- 東アジアロケール（日本語・韓国語・中国語）で一般的な「万・億・兆」単位をサポートし、表示（format）と逆変換（unformat）の双方で自然な表現を出す。
- 既存の短縮（thousand/million/billion/trillion）挙動はデフォルトで維持し、後方互換性を壊さない。

設計（要点）
----
- ロケール側に任意フィールドを追加:
  - `abbreviationScheme`: 文字列（例: "short-scale"（既定）, "cjk"）
  - `abbreviationUnits`: 単位キー → 倍率（数値） 例: `{ man:1e4, oku:1e8, cho:1e12 }`
  - `displayAbbreviations`（任意）: 単位キー → 表示文字列 例: `{ man: "万", oku: "億", cho: "兆" }`

- 実装側（概要）: `globalState` に getter を追加し、`formatting` と `unformatting` が言語ごとの `abbreviationUnits` と `displayAbbreviations` を参照する。
- デフォルトは従来通りの short-scale（thousand/million/billion/trillion）を返すため、既存挙動は変わらない。

ロケールの例（`languages/ja-JP.js` に追加する場合）
----
追加例:

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

重要な注意点
----
- 既存の `abbreviations` オブジェクトは破壊的に変更しないでください（外部のコードが文字列を参照／比較している可能性があるため）。
- 新しいフィールドは任意で追加する方式にして、追加しなければ既存の挙動（short-scale）が有効になります。

期待される挙動（例）
----
- ロケールに上記 `cjk` 設定がある場合、
  - 1_200_000_000 は短縮表示で "12億" と表示される（内部で 1e8 単位で割るため）。
  - `unformat("12億")` は 1_200_000_000 を返す（roundtrip）ことを想定する。

移行手順（簡易）
----
1. コアの実装で `globalState` に新しい getter（例: `currentAbbreviationUnits()` / `currentDisplayAbbreviations()`）を追加する。
2. `src/formatting.js` の略語選択を言語ごとの `abbreviationUnits` を使うように変更する。
3. `src/unformatting.js` の逆変換でも同じマッピングを使う。
4. 各言語ファイルに必要に応じて `abbreviationScheme` と `abbreviationUnits` / `displayAbbreviations` を追加する（追加しない場合は現状の挙動を維持）。

テスト
----
- 既存のテストを残し、デフォルト挙動に変更が無いことを確認する。
- `cjk` スキーム用のユニットテストを追加する（例: `numbro(1200000000) -> "12億"`, `unformat("12億") -> 1200000000`）。

テスト（運用上の注意）
----
- 既存リポジトリのテスト群はデフォルトで short-scale を期待するため、CJK を恒久有効化すると既存の期待値と衝突する可能性があります。
- 推奨される運用パターン:
  - テスト時のみ CJK を有効にするヘルパーを用意する（`tests/helpers/enableCjkForLanguage.js` を参照）。
  - もしプロジェクト方針として CJK を恒久有効化する場合は、該当する言語テストの期待値を CJK 表記に更新してください（今回のコミットで `tests/languages/ja-JP-tests.js` 等の例を更新済み）。

変更履歴（今回の作業）
----
- `src/unformatting.js`: CJK 表示と既存の `abbreviations` 双方を認識するよう unformat の取得ロジックを拡張。
- `languages/ja-JP.js`, `languages/ko-KR.js`, `languages/zh-CN.js`: `abbreviationUnits` / `displayAbbreviations` を追加し、`ja-JP` を恒久的に `abbreviationScheme: "cjk"` に設定。
- `tests/helpers/enableCjkForLanguage.js`: テスト用ヘルパーを追加（任意）。
- 複数の言語テストの期待値を CJK に合わせて更新（`tests/languages/*-tests.js`）。

今後の作業候補
----
- `CHANGELOG.md` に互換性注意を明記。
- ドキュメント（`README.md`）の言語サンプルセクションに CJK の例を追加。
- 他の東アジアロケールの翻訳者に変更を通知し、表示ラベルの確認を依頼する。

今回の実施変更（詳細）
----
- `languages/ja-JP.js`: `abbreviationScheme: "cjk"` を恒久的に設定、`abbreviationUnits`/`displayAbbreviations` を追加、通貨記号を `円` に変更。
- `languages/ko-KR.js`: `abbreviationUnits`/`displayAbbreviations` を追加（CJK 対応）。
- `languages/zh-CN.js`, `languages/zh-TW.js`, `languages/zh-SG.js`, `languages/zh-MO.js`: `abbreviationScheme: "cjk"` と `abbreviationUnits`/`displayAbbreviations` を追加。
- `src/unformatting.js`: レガシーの `abbreviations` と CJK の `displayAbbreviations` をマージして逆変換で両方を認識するように変更。さらに略称のマッチング順を "長いトークン優先" に変更して `百萬` と `萬` のような重複を正しく処理するように改善。
- `tests/helpers/enableCjkForLanguage.js`: テスト用ヘルパーを追加（テスト時に言語オブジェクトを CJK モードに切り替え可能）。
- 各言語のテスト（`tests/languages/*-tests.js`）: CJK 恒久有効化に合わせ、一部の期待値（短縮表示・通貨フォーマット・unformat の文字列）を CJK 表記に更新。
- `languages/zh-TW.js`: `ordinal()` を "." に変更（従来の誤った `第` を修正）。

これらの変更はユニットテスト（`npm run test:unit`）で全通過を確認済みです（465 specs, 0 failures）。

注意: 恒久的に CJK スキームを有効化すると既存の表示期待値が変わるため、今回のようにテスト期待値の更新が必要になります。リリースノートに互換性の注意と移行手順を明記することを推奨します。

参考
----
- 実装は `src/formatting.js` と `src/unformatting.js` を最小限変更する設計が推奨されます。言語ファイルは既存の `abbreviations` を残したまま新しいフィールドを追記してください。

通貨表記の取り扱い（`currency.alternates`）
----
- 現実の入力では同一通貨を複数表現するケースが多くあります（例: 日本円は `円` / `¥`、香港は `港元` / `HK$`）。
- 本実装では、`unformat` が `currency.symbol`、`currency.alternates`（配列）、および `currency.code` をまとめて収集し、入力からそれらのトークンを除去してから数値をパースします。
- 削除は長さ降順（長いトークンを先）で行うため、部分一致による誤削除を防ぎます（例: `人民元` と `元` の競合を回避）。

例（言語ファイル）:

```js
currency: {
  symbol: "元",
  alternates: ["人民元", "¥"],
  position: "postfix",
  code: "CNY"
}
```

推奨事項
----
- `alternates` には代表的な表記のみを含め、過度に多く追加しないでください（誤削除リスク）。
- 追加した場合は `tests/languages/<tag>-tests.js` に代表例を `unformats correctly` ケースとして追加して回帰テストを作成してください。
