### Next

- Bump `lodash.template` to 4.5.0
- Fix TypeScript return type definition of `Format.currencySymbol`
- Fix #359: Add Bytes I18N possibility + French translation

### 2.2.0

- Fix dependencies through `npm audit --production`
- Fix #446: CDNJS in website Relocation. Thanks @pranithan-kang
- Fix #364: Format Decimal without Rounding. Thanks @shefrancia
- Fix #414: Fix de-CH thousands separator. Thanks @FrEaKmAn
- Fix #418: Correct symbol and sign order for formatCurrency when forceSign=true. Thanks @adriang133
- Fix #424: Add ordinal for 40 for tr-TR. Thanks @yatki
- Fix #423: No way to have space separated abbreviation and not-separated currency symbol at the same time. Thanks @Osipova
- Fix #392: Small negative numbers get the leading zero incorrectly cut off. Thanks @Rudd
- Fix #403: Update numbro.d.ts to match the current API of the library. Thanks @Monck
- Fix #428: Fix id thousands and decimal separator. Thanks @kukuhyoniatmoko
- Fix #453: Fix broken BCP47 link. Thanks @sesam

### 2.1.2

- Fix #399: Update dependencies. Thanks @baer
- Fix #390: Small changes to doc comments. Thanks @cnrudd
- Fix #328: Fixed unformat for non standard delimiters. Thanks @jkettmann

### 2.1.1

- Fix #372: Truncated numbers with trimMantissa and zero mantissa. Thanks @timfish
- Fix #367: Fixes duplicate call of chooseLanguage when setting a language without subtag. Thanks @LarsBauer
- Fix #363: Enable es6 imports when using typescript. Thanks @aralisza
- Fix #353: Add monthly download to README. Thanks @BenjaminVanRyseghem

### 2.1.0

- Fix #358: Maximal mantissa. Thanks @BenjaminVanRyseghem.
- Fix #345: export Format interface. Thanks @jordydejong.
- Fix #348: fixed currency position for nl-NL. Thanks @jordydejong.

### 2.0.6

- Fix #344: Add format option to specify currency symbol position. Thanks @BenjaminVanRyseghem.
- Fix #343: Mantissa not taken into account when no decimals. Thanks @BenjaminVanRyseghem.
- Fix #342: fix typing of numbro.languages(). Thanks @ntamas.
- Fix #334: Update numbro.d.ts. Thanks @sousarka.
- Fix #330: Fix language file permissions. Thanks @thomas88.

### 2.0.5

- Fix #325: Unable to resolve module `./globalState`. Thanks @BenjaminVanRyseghem.
- Fix #323: add missing option in typings. Thanks @nicolashenry.
- Fix #322: "spaced" should be optional in typings. Thanks @nicolashenry.

### 2.0.4

- Fix #321: formatCurrency with a string format throws. Thanks @BenjaminVanRyseghem.

### 2.0.3

- Fix #319: Fix typings. Thanks @nicolashenry.
- Fix #320: Fix main entry of package.json. Thanks @BenjaminVanRyseghem.

### 2.0.2

- Fix failing npm publish

### 2.0.1

- Fix #318: v2.0 is not importable due to invalid package.json. Thanks @BenjaminVanRyseghem.

### 2.0.0

- Complete rewrite of numbro (#305). Thanks @BenjaminVanRyseghem.

### 1.11.1

- Fix copyright owner references.
- Fix #313: add es-MX language definition. Thanks @joebordes.

### 1.11.0

- Fix #232: update numbro.d.ts to use export = instead of export default. Thanks @olmobrutall.
- Fix #241: Added bg localization. Thanks @gwynjudd.
- Fix #248: Fix index.js generation for culture neutral codes. Thanks @gwynjudd.
- Fix #255: Allow four character country code. Thanks @gwynjudd.
- Fix #260: Added el localization. Thanks @gwynjudd.
- Fix #269: Fix thousands and decimal separator for en-ZA. Thanks @gwynjudd.
- Fix #271: Added es-CL localization. Thanks @gwynjudd.
- Fix #272: Added es-CO localization. Thanks @gwynjudd.
- Fix #273: Added es-CR localization. Thanks @gwynjudd.
- Fix #274: Added es-NI localization. Thanks @gwynjudd.
- Fix #275: Added es-PE localization. Thanks @gwynjudd.
- Fix #276: Added es-PR localization. Thanks @gwynjudd.
- Fix #277: Added es-SV localization. Thanks @gwynjudd.

### 1.10.1

- Fix #239: Add de-AT localization. Thanks @gwynjudd.
- Fix #242: Added de-LI localisation. Thanks @gwynjudd.
- Fix #243: en-IE localization. Thanks @gwynjudd.
- Fix #246: Added it-CH localization. Thanks @gwynjudd.
- Fix #265: Revert Error thrown when invalid input. Thanks @BenjaminVanRyseghem.

### 1.10.0

- Fix #213: Unhelpful Error Message with $ as Format String. Thanks @reustle.
- Fix #221: update package.json license field. Thanks @mguida22.
- Fix #190: Allow abbreviation precision for < 4. Thanks @chrisnicola.
- Fix #227: Add Romanian locale. Thanks @herodrigues.
- Fix #222: allow a decimal format for an integer. Thanks @mguida22.
- Fix #233: Correct CZ and SK locales (finally). Thanks @smajl.
- Fix #244: Fixes for fr-CH. Thanks @gwynjudd.
- Fix #262: Better input validation. Thanks @BenjaminVanRyseghem.

### 1.9.3

- Fix #184: Accurate, up-to-date type definitions for TypeScript. Thanks @dpoggi.
- Fix #196: Fix german language specifications. Thanks @Ben305.
- Fix #197: Add detection for Meteor. Thanks @Ben305.
- Fix #206: fix number formats for de-CH. Thanks @Remo.

### 1.9.2

- Fix #195: Fixed wrong results from formatForeignCurrency. Thanks @Ben305.

### 1.9.1

- Add forgotten files

### 1.9.0

- Fix #192: Add locales en-AU and en-NZ. Thanks @Ben305.
- Fix #193: Add function formatForeignCurrency. Thanks @Ben305.
- Fix #194: Fix undefined error on React native. Thanks @abalhier.

### 1.8.1

- Fix #182: Added support for numbers without leading zero. Thanks @budnix.
- Fix #183: Number validation doesn't validate negative numbers. Thanks @budnix.

### 1.8.0

- Fix #180: Add culture function, deprecate language. Thanks @wereHamster.
- Fix #170: Add the ability to determine units without formatting. Thanks @pickypg.
- Fix #162: Add TypeScript declaration file. Thanks @wereHamster.
- Fix #163: unformat: return undefined when value can't be parsed. Thanks @wereHamster.
- Fix #173: Added two latest stable node versions to Travis build. Thanks @therebelrobot.
- Fix #176: default pt-BR currency is prefix, not postfix. Thanks @luisrudge.
- Fix #175: Zero byte unit fix, take 2. Thanks @therebelrobot.
- Fix #135: Fix fr-CA currency format. Thanks @killfish.
- Fix #174: Set versions for all deps. Thanks @BenjaminVanRyseghem.
- Fix #152: Use zeros() function instead of multiple inline implementations. Thanks @MarkHerhold.

### 1.7.1

- Fix #142: Limit packaging extraneous files. Thanks @MarkHerhold.
- Fix #143: Fixing web build. Thanks @mmollick.
- Fix #149: Allow loading of cultures in node explicitly if numbro hasn't detected correctly that it is in node. Thanks @stewart42.
- Fix #147: Fixing formatting issues for very small (+/-1e-23) numbers. Thanks @MarkHerhold.

### 1.7.0

- Fix decimal rounding issue. Thangrks @Shraymonks.
- Fix #114: webpack bundling. Thanks @mmollick.
- Add ko-KR & zh-TW support. Thanks @rocketedaway and @rWilander.
- Add existence check for require. Thanks @jamiter.
- Improve verbatim feature. Thanks @jneill.

### 1.6.2

- Fix deprecated use of `language` and introduce `cultureCode`. Thanks @BenjaminVanRyseghem

### 1.6.1

- Fix languages to use proper intPrecision. Thanks @BenjaminVanRyseghem
- Fix `intPrecision` when value is 0. Thanks @BenjaminVanRyseghem

### 1.6.0

- Introduce new API functions:

    - setCulture
    - culture
    - cultureData
    - cultures

- Deprecate API functions:

    - setLanguage
    - language
    - languageData
    - languages

Those deprecated functions will be removed in version 2.0.0

### 1.5.2

- Fixed scoping issue. Thanks @tuimz
- #68 Format decimal numbers. Thanks @BenjaminVanRyseghem
- #70 v1.5.0 error with browserify. Thanks @BenjaminVanRyseghem
- #71 Incorrectly reporting hasModule = true. Thanks @BenjaminVanRyseghem
- #72 the currency symbol is $ which is a currency symbol already by itself (the dollar..). Thanks @BenjaminVanRyseghem
- #76 ability to "pad" a number in formatting. Thanks @BenjaminVanRyseghem
- #79 browserify attempts to load all language files. Thanks @BenjaminVanRyseghem
- #106 Exception on large number formatting. Thanks @andrewla

### 1.5.1

- #78 Why is 0 formatted as +0?. Thanks to @clayzermk1
- #80 currency format "+$..." produces output "$+...". Thanks to @clayzermk1
- Fixes German separator. Thanks to @gka

### 1.5.0

- Adds support for Hebrew (he-LI). Thanks to @eli-zehavi

### 1.4.0

- #62 using languages in node. Thanks @alexkwolfe

### 1.3.3

- #64 multiply loses accuracy on minification. Thanks @rafde

### 1.3.2

- Fix issue with the release process

### 1.3.1

- Fix context issue when in strict mode. Thanks @avetisk

### 1.3.0

- #53 Max significant numbers formating. Thanks @BenjaminVanRyseghem
- #57 Broken reference to this in languages. Thanks @BenjaminVanRyseghem

### 1.2.2

- Remove old minified files

### 1.2.1

- Forgot to build when published

### 1.2.0

- #27 Binary and decimal bytes. Thanks @clayzermk1 and @Graham42
- #26 Jshint improvemnents. Thanks @baer and @Graham42
- Fixes french ordinal. Thanks @BenjaminVanRyseghem
- #32 Use svg instead of png to get better image quality. Thanks @PeterDaveHello
- #33 Correct culture code for Español. Thanks @maheshsenni
- #34 Clean up locales info. Thanks @Graham42
- #36 Improve `dist/` layout. Thanks @Graham42
- #35 Correct Polish currency symbol. Thanks @Graham42
- Fixes Swedish tests. Thanks @BenjaminVanRyseghem
- Fixes inconsistent white spaces. Thanks @BenjaminVanRyseghem
- #44 Tests for culture code format. Thanks @maheshsenni
- #50 added en-ZA language. Thanks @stewart42

### 1.1.1

- Fixes minified version number. Thanks @BenjaminVanRyseghem
- Removes old minified files. Thanks @Graham42

### 1.1.0

- Adds `languages` to expose all registered languages. Thanks @NicolasPetton
- Adds support for filipino. Thanks @Graham42 and @mjmaix
- Adds support for farsi. Thanks @Graham42 and @neo13

### 1.0.5

- Improves release process. Thanks @Graham42
- Updates the `README` file. Thanks @Graham42
- Fixes Danish currency symbol. Thanks @Graham42 and @philostler
- Fixes npm/bower dependencies. Thanks @BenjaminVanRyseghem
- Cleans up Numeral-js leftovers. Thanks @uniphil
- Updates homepage url. Thanks @BenjaminVanRyseghem
- Rebases on Numeraljs to keep git history. Thanks @uniphil @Graham42

### 1.0.4

Fork `numeraljs` v1.5.3, renaming everything to `numbro`

----

_For changes before `numbro` forked [`numeral-js`](https://github.com/adamwdraper/Numeral-js), see [CHANGELOG-Numeraljs.md](CHANGELOG-Numeraljs.md)._
