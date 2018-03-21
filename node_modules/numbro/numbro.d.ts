// Definitions by: Dan Poggi <https://github.com/dpoggi>

declare function numbro(value?: any): numbro.Numbro;

declare namespace numbro {

    export const version: string;

    export function isNumbro(value: any): value is Numbro;

    export function language(): string;

    export function registerLanguage(tag: NumbroLanguage, useLanguage ?: boolean): string;

    export function setLanguage(tag: string, fallbackTag ?: string): void;

    export function languages(): { [tag: string]: NumbroLanguage };

    export function languageData(tag ?: string): NumbroLanguage;

    export function zeroFormat(newFormat: string): void;

    export function defaultFormat(): {};

    export function defaultCurrencyFormat(newFormat: string): {};

    export function validate(value: string, format: {} | string): boolean;

    export function loadLanguagesInNode(): void;

    export function unformat(input: string, format?: {} | string): number;

    interface Numbro {
        clone(): Numbro;

        format(format?: {} | string): string;

        formatCurrency(format?: {} | string): string;

        formatTime(format?: {} | string): string;

        binaryByteUnits(): string;

        decimalByteUnits(): string;

        byteUnits(): string;

        difference(value: number): number;

        add(value: number): this;

        subtract(value: number): this;

        multiply(value: number): this;

        divide(value: number): this;

        set(value: number): this;

        value(): number;

        valueOf(): number;
    }

    interface Format {
        prefix?: number;
        postfix?: number;
        characteristic?: number;
        forceAverage?: "trillion" | "billion" | "million" | "thousand";
        average?: boolean;
        mantissa?: number;
        optionalMantissa?: boolean;
        thousandSeparated?: boolean;
        negative?: "sign" | "parenthesis";
        forceSign?: boolean;
        totalLength?: number;
        spaceSeparated?: boolean;
        output?: "currency" | "percent" | "byte" | "time" | "ordinal" | "number";
    }

    export interface NumbroLanguage {
        languageTag: string;

        delimiters: {
            thousands: string;
            decimal: string;
        };

        abbreviations: {
            thousand: string;
            million: string;
            billion: string;
            trillion: string;
            spaced?: boolean;
        };

        ordinal(num: number): string;

        currency: {
            symbol: string;
            position: string;
            code: string;
        };

        defaults?: Format;

        ordinalFormat?: Format;

        byteFormat?: Format;

        percentageFormat?: Format;

        currencyFormat?: Format;

        formats: {
            fourDigits: Format;
            fullWithTwoDecimals: Format;
            fullWithTwoDecimalsNoCurrency: Format;
            fullWithNoDecimals: Format;
        };
    }
}

export = numbro;
