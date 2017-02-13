// Definitions by: Dan Poggi <https://github.com/dpoggi>

declare function numbro(value?: any): numbro.Numbro;

declare namespace numbro {
    
    export const version: string;
    export function isNumbro(value: any): value is Numbro;

    export function setCulture(newCultureCode: string, fallbackCultureCode ?: string): void;
    export function culture(): string;
    export function culture(cultureCode: string): void;
    export function culture(cultureCode: string, newCulture: NumbroCulture): typeof numbro;
    export function cultureData(cultureCode ?: string): NumbroCulture;
    export function cultures(): Array<NumbroCulture>;

    /**
     * Language functions
     *
     * @deprecated Since version 1.6.0. Will be removed in version 2.0. Use the
     * culture versions instead.
     */
    export function setLanguage(newCultureCode: string, fallbackCultureCode ?: string): void;
    export function language(): string;
    export function language(cultureCode: string): void;
    export function language(cultureCode: string, newCulture: NumbroCulture): typeof numbro;
    export function languageData(cultureCode ?: string): NumbroCulture;
    export function languages(): Array<NumbroCulture>;

    export function zeroFormat(newFormat: string): void;
    export function defaultFormat(newFormat: string): void;
    export function defaultCurrencyFormat(newFormat: string): void;

    export function validate(value: string, cultureCode ?: string): boolean;

    export function loadCulturesInNode(): void;

    /**
     * @deprecated Since version 1.6.0. Will be removed in version 2.0. Use the
     * culture version instead.
     */
    export function loadLanguagesInNode(): void;

    interface Numbro {
        clone(): Numbro;

        format(formatString?: string, roundingFunction?: RoundingFunction): string;
        formatCurrency(formatString?: string, roundingFunction?: RoundingFunction): string;
        unformat(formattedNumber: string): number;

        binaryByteUnits(): string;
        byteUnits(): string;
        decimalByteUnits(): string;

        value(): number;
        valueOf(): number;

        set(value: number): this;
        add(value: number): this;
        subtract(value: number): this;
        multiply(value: number): this;
        divide(value: number): this;

        difference(value: number): number;
    }

    export interface NumbroCulture {
        langLocaleCode: string;
        cultureCode: string;
        delimiters: {
            thousands: string;
            decimal: string;
        };
        abbreviations: {
            thousand: string;
            million: string;
            billion: string;
            trillion: string;
        };
        ordinal(num: number): string;
        currency: {
            symbol: string;
            position: string;
        };
        defaults: {
            currencyFormat: string;
        };
        formats: {
            fourDigits: string;
            fullWithTwoDecimals: string;
            fullWithTwoDecimalsNoCurrency: string;
            fullWithNoDecimals: string;
        };
    }

    export interface RoundingFunction {
        (x: number): number;
    }
}

export = numbro;