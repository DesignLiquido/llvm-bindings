import llvm from '../..';

describe('AtomicRMWInst', () => {
    test('BinOp enum contains all expected values including LLVM 21 additions', () => {
        const binOp = llvm.AtomicRMWInst.BinOp;
        expect(typeof binOp.Xchg).toBe('number');
        expect(typeof binOp.Add).toBe('number');
        expect(typeof binOp.Sub).toBe('number');
        expect(typeof binOp.And).toBe('number');
        expect(typeof binOp.Nand).toBe('number');
        expect(typeof binOp.Or).toBe('number');
        expect(typeof binOp.Xor).toBe('number');
        expect(typeof binOp.Max).toBe('number');
        expect(typeof binOp.Min).toBe('number');
        expect(typeof binOp.UMax).toBe('number');
        expect(typeof binOp.UMin).toBe('number');
        expect(typeof binOp.FAdd).toBe('number');
        expect(typeof binOp.FSub).toBe('number');
        expect(typeof binOp.FMax).toBe('number');
        expect(typeof binOp.FMin).toBe('number');
        // New in LLVM 21
        expect(typeof binOp.FMaximum).toBe('number');
        expect(typeof binOp.FMinimum).toBe('number');
    });

    test('BinOp values are distinct', () => {
        const { Xchg, Add, Sub, And, Nand, Or, Xor, Max, Min, UMax, UMin, FAdd, FSub, FMax, FMin, FMaximum, FMinimum } = llvm.AtomicRMWInst.BinOp;
        const values = [Xchg, Add, Sub, And, Nand, Or, Xor, Max, Min, UMax, UMin, FAdd, FSub, FMax, FMin, FMaximum, FMinimum];
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });

    test('IRBuilder.CreateAtomicRMW produces an AtomicRMWInst', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('atomicRMW', context);
        const builder = new llvm.IRBuilder(context);
        const i32Ty = llvm.Type.getInt32Ty(context);
        const ptrTy = llvm.PointerType.getUnqual(context);
        const fnType = llvm.FunctionType.get(i32Ty, [ptrTy, i32Ty], false);
        const fn = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'atomicAdd', module);
        const entryBB = llvm.BasicBlock.Create(context, 'entry', fn);
        builder.SetInsertPoint(entryBB);

        const ptr = fn.getArg(0);
        const val = fn.getArg(1);
        const inst = builder.CreateAtomicRMW(
            llvm.AtomicRMWInst.BinOp.Add,
            ptr,
            val,
            4,
            llvm.AtomicOrdering.SequentiallyConsistent
        );
        builder.CreateRet(inst);

        expect(inst).toBeInstanceOf(llvm.AtomicRMWInst);
        expect(inst.getOperation()).toBe(llvm.AtomicRMWInst.BinOp.Add);
        expect(llvm.verifyFunction(fn)).toBe(false);
    });

    test('getOperation returns the correct BinOp', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('atomicRMW', context);
        const builder = new llvm.IRBuilder(context);
        const i32Ty = llvm.Type.getInt32Ty(context);
        const ptrTy = llvm.PointerType.getUnqual(context);
        const fnType = llvm.FunctionType.get(i32Ty, [ptrTy, i32Ty], false);
        const fn = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'atomicXchg', module);
        const entryBB = llvm.BasicBlock.Create(context, 'entry', fn);
        builder.SetInsertPoint(entryBB);

        const ptr = fn.getArg(0);
        const val = fn.getArg(1);
        const inst = builder.CreateAtomicRMW(
            llvm.AtomicRMWInst.BinOp.Xchg,
            ptr,
            val,
            4,
            llvm.AtomicOrdering.Monotonic
        );
        builder.CreateRet(inst);

        expect(inst.getOperation()).toBe(llvm.AtomicRMWInst.BinOp.Xchg);
    });
});
