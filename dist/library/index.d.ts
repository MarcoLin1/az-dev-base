declare const defaultCallbackPromise: ({ result, error }: {
    result: any;
    error: any;
}) => Promise<any>;
declare function isFunction(object: any): any;
declare function isFunctionV2(object: any): boolean;
declare const lowerTheFirstLetter: (str: any) => any;
declare const toCamel: (str: any) => any;
declare const toUnderscore: (str: any) => any;
declare const toDashed: (str: any) => any;
declare const capitalizeFirstLetter: (str: any) => any;
declare const toSafename: (str: any) => any;
declare const toCurrency: (number: any) => any;
declare const toFloatCurrency: (v: any, d?: number) => string;
declare const leftJustify: (s: any, length: any, char: any) => string;
declare const rightJustify: (s: any, length: any, char: any) => string;
export { lowerTheFirstLetter, toDashed, toSafename, toCamel, toUnderscore, capitalizeFirstLetter, toCurrency, toFloatCurrency, defaultCallbackPromise, isFunction, isFunctionV2, leftJustify, rightJustify, };
