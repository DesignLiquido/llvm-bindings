import llvm from '../..';

describe('Test APInt', () => {
    test('APInt constructor accepts a number value', () => {
        const apInt = new llvm.APInt(32, 42);
        expect(apInt).toBeInstanceOf(llvm.APInt);
    });

    test('APInt constructor accepts a bigint value', () => {
        const apInt = new llvm.APInt(64, BigInt('9007199254740993')); // > Number.MAX_SAFE_INTEGER
        expect(apInt).toBeInstanceOf(llvm.APInt);
    });

    test('APInt constructor accepts bigint 0', () => {
        const apInt = new llvm.APInt(32, BigInt(0));
        expect(apInt).toBeInstanceOf(llvm.APInt);
    });

    test('APInt constructor accepts isSigned with bigint', () => {
        const apInt = new llvm.APInt(64, BigInt(123), true);
        expect(apInt).toBeInstanceOf(llvm.APInt);
    });

    test('APInt constructor throws without enough arguments', () => {
        expect(() => new (llvm.APInt as any)()).toThrow();
        expect(() => new (llvm.APInt as any)(32)).toThrow();
    });
});
