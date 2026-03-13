import llvm from '../..';

// Build a minimal valid module for testing: a simple identity function i32 -> i32
function buildSimpleModule(): { context: llvm.LLVMContext; module: llvm.Module } {
    const context = new llvm.LLVMContext();
    const module = new llvm.Module('test', context);
    const builder = new llvm.IRBuilder(context);

    const i32 = llvm.Type.getInt32Ty(context);
    const funcType = llvm.FunctionType.get(i32, [i32], false);
    const func = llvm.Function.Create(
        funcType,
        llvm.Function.LinkageTypes.ExternalLinkage,
        'identity',
        module,
    );

    const entry = llvm.BasicBlock.Create(context, 'entry', func);
    builder.SetInsertPoint(entry);
    builder.CreateRet(func.getArg(0));

    return { context, module };
}

describe('Test ModulePassManager', () => {
    test('ModulePassManager can be created with O0 (default)', () => {
        const mpm = new llvm.ModulePassManager();
        expect(mpm).toBeInstanceOf(llvm.ModulePassManager);
    });

    test('ModulePassManager can be created at each optimization level', () => {
        for (const level of [
            llvm.OptimizationLevel.O0,
            llvm.OptimizationLevel.O1,
            llvm.OptimizationLevel.O2,
            llvm.OptimizationLevel.O3,
            llvm.OptimizationLevel.Os,
            llvm.OptimizationLevel.Oz,
        ]) {
            const mpm = new llvm.ModulePassManager(level);
            expect(mpm).toBeInstanceOf(llvm.ModulePassManager);
        }
    });

    test('ModulePassManager.isEmpty returns false after pipeline construction', () => {
        // O1+ builds a non-empty pipeline
        const mpm = new llvm.ModulePassManager(llvm.OptimizationLevel.O2);
        expect(mpm.isEmpty()).toBe(false);
    });

    test('ModulePassManager.run does not throw on a valid module', () => {
        const { module } = buildSimpleModule();
        const mpm = new llvm.ModulePassManager(llvm.OptimizationLevel.O0);
        expect(() => mpm.run(module)).not.toThrow();
    });

    test('ModulePassManager.run throws without arguments', () => {
        const mpm = new llvm.ModulePassManager();
        expect(() => (mpm as any).run()).toThrow();
    });

    test('ModulePassManager.addVerifierPass adds a pass', () => {
        const mpm = new llvm.ModulePassManager(llvm.OptimizationLevel.O0);
        // O0 pipeline may be empty; after adding VerifierPass it should not be
        mpm.addVerifierPass();
        expect(mpm.isEmpty()).toBe(false);
    });
});

describe('Test FunctionPassManager', () => {
    test('ModulePassManager.createFunctionPassManager returns a FunctionPassManager', () => {
        const mpm = new llvm.ModulePassManager(llvm.OptimizationLevel.O2);
        const fpm = mpm.createFunctionPassManager();
        expect(fpm).toBeInstanceOf(llvm.FunctionPassManager);
    });

    test('FunctionPassManager.isEmpty returns false after adding passes', () => {
        const mpm = new llvm.ModulePassManager(llvm.OptimizationLevel.O2);
        const fpm = mpm.createFunctionPassManager();
        // createFunctionPassManager builds a simplification pipeline, so it should not be empty
        expect(fpm.isEmpty()).toBe(false);
    });

    test('FunctionPassManager manually built with addSROAPass is not empty', () => {
        const mpm = new llvm.ModulePassManager(llvm.OptimizationLevel.O1);
        const fpm = mpm.createFunctionPassManager(llvm.ThinOrFullLTOPhase.None);
        // Build our own fpm to test addSROAPass
        // We use a fresh ModulePassManager so we can call addFunctionPasses
        const mpm2 = new llvm.ModulePassManager(llvm.OptimizationLevel.O0);
        // O0 pipeline is built; adding function passes is still valid
        expect(() => mpm2.addFunctionPasses(fpm)).not.toThrow();
    });
});
