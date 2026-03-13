import llvm from '../..';

describe('Test CodeGen enums', () => {
    test('Reloc enum values are defined', () => {
        expect(typeof llvm.Reloc.Static).toBe('number');
        expect(typeof llvm.Reloc.PIC_).toBe('number');
        expect(typeof llvm.Reloc.DynamicNoPIC).toBe('number');
        expect(typeof llvm.Reloc.ROPI).toBe('number');
        expect(typeof llvm.Reloc.RWPI).toBe('number');
        expect(typeof llvm.Reloc.ROPI_RWPI).toBe('number');
        // Values must be distinct
        const values = [
            llvm.Reloc.Static, llvm.Reloc.PIC_, llvm.Reloc.DynamicNoPIC,
            llvm.Reloc.ROPI, llvm.Reloc.RWPI, llvm.Reloc.ROPI_RWPI,
        ];
        expect(new Set(values).size).toBe(values.length);
    });

    test('CodeModel enum values are defined', () => {
        expect(typeof llvm.CodeModel.Tiny).toBe('number');
        expect(typeof llvm.CodeModel.Small).toBe('number');
        expect(typeof llvm.CodeModel.Kernel).toBe('number');
        expect(typeof llvm.CodeModel.Medium).toBe('number');
        expect(typeof llvm.CodeModel.Large).toBe('number');
        // Values must be distinct
        const values = [
            llvm.CodeModel.Tiny, llvm.CodeModel.Small, llvm.CodeModel.Kernel,
            llvm.CodeModel.Medium, llvm.CodeModel.Large,
        ];
        expect(new Set(values).size).toBe(values.length);
    });

    test('CodeGenOpt enum values are defined and ordered', () => {
        expect(typeof llvm.CodeGenOpt.None).toBe('number');
        expect(typeof llvm.CodeGenOpt.Less).toBe('number');
        expect(typeof llvm.CodeGenOpt.Default).toBe('number');
        expect(typeof llvm.CodeGenOpt.Aggressive).toBe('number');
        // Values must be distinct
        const values = [
            llvm.CodeGenOpt.None, llvm.CodeGenOpt.Less,
            llvm.CodeGenOpt.Default, llvm.CodeGenOpt.Aggressive,
        ];
        expect(new Set(values).size).toBe(values.length);
    });

    test('CodeGenFileType enum values are defined', () => {
        expect(typeof llvm.CodeGenFileType.Assembly).toBe('number');
        expect(typeof llvm.CodeGenFileType.Object).toBe('number');
        expect(typeof llvm.CodeGenFileType.Null).toBe('number');
        // Values must be distinct
        const values = [
            llvm.CodeGenFileType.Assembly,
            llvm.CodeGenFileType.Object,
            llvm.CodeGenFileType.Null,
        ];
        expect(new Set(values).size).toBe(values.length);
    });
});
