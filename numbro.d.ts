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

    export function setDefaults(format: Format | string): void;

    export function defaultCurrencyFormat(newFormat: string): {};

    export function validate(value: string, format: Format | string): boolean;

    export function loadLanguagesInNode(): void;

    export function unformat(input: string, format?: Format | string): number;

    interface Numbro {
        clone(): Numbro;

        format(format?: Format | string): string;

        formatCurrency(format?: Format | string): string;

        formatTime(format?: Format | string): string;

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

    export interface Format {
        output?: "currency" | "percent" | "byte" | "time" | "ordinal" | "number";
        base?: "decimal" | "binary" | "general";
        characteristic?: number;
        prefix?: string;
        postfix?: string;
        forceAverage?: "trillion" | "billion" | "million" | "thousand";
        average?: boolean;
        currencyPosition?: "prefix" | "infix" | "postfix";
        currencySymbol?: string;
        totalLength?: number;
        mantissa?: number;
        optionalMantissa?: boolean;
        trimMantissa?: boolean;
        optionalCharacteristic?: boolean;
        thousandSeparated?: boolean;
        abbreviations?: {
            thousand?: string;
            million?: string;
            billion?: string;
            trillion?: string;
        };
        negative?: "sign" | "parenthesis";
        forceSign?: boolean;
        spaceSeparated?: boolean;
        spaceSeparatedCurrency?: boolean;
        spaceSeparatedAbbreviation?: boolean;
        exponential?: boolean;
        prefixSymbol?: boolean;
        roundingFunction?: (num: number) => number;
    }

    export interface NumbroLanguage {
        languageTag: string;

        delimiters: {
            thousands: string;
            decimal: string;
            thousandsSize?: number;
        };

        abbreviations: {
            thousand: string;
            million: string;
            billion: string;
            trillion: string;
        };

        spaceSeparated?: boolean;

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

        timeDefaults?: Format;

        formats: {
            fourDigits: Format;
            fullWithTwoDecimals: Format;
            fullWithTwoDecimalsNoCurrency: Format;
            fullWithNoDecimals: Format;
        };
    }
}

export default numbro;
