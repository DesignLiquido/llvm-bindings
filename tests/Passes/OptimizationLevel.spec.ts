import llvm from '../..';

describe('Test OptimizationLevel', () => {
    test('OptimizationLevel enum values are defined and distinct', () => {
        expect(typeof llvm.OptimizationLevel.O0).toBe('number');
        expect(typeof llvm.OptimizationLevel.O1).toBe('number');
        expect(typeof llvm.OptimizationLevel.O2).toBe('number');
        expect(typeof llvm.OptimizationLevel.O3).toBe('number');
        expect(typeof llvm.OptimizationLevel.Os).toBe('number');
        expect(typeof llvm.OptimizationLevel.Oz).toBe('number');

        const values = [
            llvm.OptimizationLevel.O0, llvm.OptimizationLevel.O1,
            llvm.OptimizationLevel.O2, llvm.OptimizationLevel.O3,
            llvm.OptimizationLevel.Os, llvm.OptimizationLevel.Oz,
        ];
        expect(new Set(values).size).toBe(values.length);
    });
});

describe('Test ThinOrFullLTOPhase', () => {
    test('ThinOrFullLTOPhase enum values are defined and distinct', () => {
        expect(typeof llvm.ThinOrFullLTOPhase.None).toBe('number');
        expect(typeof llvm.ThinOrFullLTOPhase.ThinLTOPreLink).toBe('number');
        expect(typeof llvm.ThinOrFullLTOPhase.ThinLTOPostLink).toBe('number');
        expect(typeof llvm.ThinOrFullLTOPhase.FullLTOPreLink).toBe('number');
        expect(typeof llvm.ThinOrFullLTOPhase.FullLTOPostLink).toBe('number');

        const values = [
            llvm.ThinOrFullLTOPhase.None,
            llvm.ThinOrFullLTOPhase.ThinLTOPreLink,
            llvm.ThinOrFullLTOPhase.ThinLTOPostLink,
            llvm.ThinOrFullLTOPhase.FullLTOPreLink,
            llvm.ThinOrFullLTOPhase.FullLTOPostLink,
        ];
        expect(new Set(values).size).toBe(values.length);
    });
});
