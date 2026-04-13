module.exports = function enableCjkForLanguage(lang) {
    if (!lang) return lang;
    if (lang.abbreviationUnits || lang.displayAbbreviations) {
        lang.abbreviationScheme = "cjk";
    }
    return lang;
};
