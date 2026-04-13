const numbro = require('../src/numbro');
const zhCN = require('../languages/zh-CN');
const zhTW = require('../languages/zh-TW');
const enable = lang => { if (lang.abbreviationUnits || lang.displayAbbreviations) lang.abbreviationScheme = 'cjk'; return lang; };

enable(zhCN);
enable(zhTW);

console.log('zh-CN currency:', JSON.stringify(zhCN.currency));
console.log('zh-TW currency:', JSON.stringify(zhTW.currency));

numbro.registerLanguage(zhCN, true);
console.log("zh-CN (-1000.234) ($0,0):", numbro(-1000.234).format('($0,0)'));
console.log("zh-CN (1000.234) $0,0.00:", numbro(1000.234).format('$0,0.00'));
console.log("zh-CN (1230974) ($0.00a):", numbro(1230974).format('($0.00a)'));

numbro.registerLanguage(zhTW, true);
console.log("zh-TW (-1000.234) ($0,0):", numbro(-1000.234).format('($0,0)'));
console.log("zh-TW (1000.234) $0,0.00:", numbro(1000.234).format('$0,0.00'));
console.log("zh-TW (1230974) ($0.00a):", numbro(1230974).format('($0.00a)'));
