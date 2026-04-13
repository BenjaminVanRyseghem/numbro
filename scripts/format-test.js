const numbro = require('../src/numbro');
const zhCN = require('../languages/zh-CN');

numbro.registerLanguage(zhCN, true);
const values = ['0,0','0,0.0','(0,0)','$0,0','($0,0)'];
const input = -1000.234;
values.forEach(fmt => console.log(fmt, '=>', numbro(input).format(fmt)));
