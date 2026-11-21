import llvm from '../..';

function makeI32BinOpSetup() {
    const context = new llvm.LLVMContext();
    const theModule = new llvm.Module('IRBuilderTest', context);
    const builder = new llvm.IRBuilder(context);
    const i32Ty = llvm.Type.getInt32Ty(context);
    const fnType = llvm.FunctionType.get(i32Ty, [i32Ty, i32Ty], false);
    const fn = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'testFn', theModule);
    const entryBB = llvm.BasicBlock.Create(context, 'entry', fn);
    builder.SetInsertPoint(entryBB);
    const a = fn.getArg(0);
    const b = fn.getArg(1);
    return { context, theModule, builder, fn, a, b };
}

function makeI32UnOpSetup() {
    const context = new llvm.LLVMContext();
    const theModule = new llvm.Module('IRBuilderTest', context);
    const builder = new llvm.IRBuilder(context);
    const i32Ty = llvm.Type.getInt32Ty(context);
    const fnType = llvm.FunctionType.get(i32Ty, [i32Ty], false);
    const fn = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'testFn', theModule);
    const entryBB = llvm.BasicBlock.Create(context, 'entry', fn);
    builder.SetInsertPoint(entryBB);
    const a = fn.getArg(0);
    return { context, theModule, builder, fn, a };
}

describe('IRBuilder', () => {
    describe('Insertion points', () => {
        test('saveIP/restoreIP returns to the saved position without throwing', () => {
            const { context, theModule, builder, fn, a, b } = makeI32BinOpSetup();
            const otherBB = llvm.BasicBlock.Create(context, 'other', fn);

            const ip = builder.saveIP();
            builder.SetInsertPoint(otherBB);
            builder.CreateUnreachable();
            expect(() => builder.restoreIP(ip)).not.toThrow();

            builder.CreateRet(builder.CreateAdd(a, b, 'sum'));
            expect(fn.getEntryBlock().getTerminator()).not.toBeNull();
            expect(llvm.verifyModule(theModule)).toBe(false);
            expect(theModule.print()).toMatch(/entry:\s+%sum = add i32 %0, %1\s+ret i32 %sum/);
        });

        test('saveAndClearIP clears the insertion point', () => {
            const { builder } = makeI32BinOpSetup();
            const ip = builder.saveAndClearIP();
            expect(builder.GetInsertBlock()).toBeNull();
            builder.restoreIP(ip);
            expect(builder.GetInsertBlock()).not.toBeNull();
        });
    });

    describe('Instruction.user_back', () => {
        test('returns the first user, or null when there is none', () => {
            const { theModule, builder, a, b } = makeI32BinOpSetup();
            const sum = builder.CreateAdd(a, b, 'sum') as llvm.Instruction;
            expect(sum.user_back()).toBeNull();
            const ret = builder.CreateRet(sum);
            expect(sum.user_back()).toBeInstanceOf(llvm.Instruction);
            expect(sum.use_back()).toBeInstanceOf(llvm.Instruction);
            expect(ret).toBeInstanceOf(llvm.ReturnInst);
            expect(llvm.verifyModule(theModule)).toBe(false);
        });
    });

    describe('NSW/NUW arithmetic', () => {
        test('CreateNSWAdd produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNSWAdd(a, b, 'nswAdd');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateNUWAdd produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNUWAdd(a, b, 'nuwAdd');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateNSWSub produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNSWSub(a, b, 'nswSub');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateNUWSub produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNUWSub(a, b, 'nuwSub');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateNSWMul produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNSWMul(a, b, 'nswMul');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateNUWMul produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNUWMul(a, b, 'nuwMul');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });
    });

    describe('Exact integer division', () => {
        test('CreateExactSDiv produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateExactSDiv(a, b, 'exactSDiv');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateExactUDiv produces a valid Value', () => {
            const { builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateExactUDiv(a, b, 'exactUDiv');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });
    });

    describe('Unary operators', () => {
        test('CreateNSWNeg produces a valid Value', () => {
            const { builder, fn, a } = makeI32UnOpSetup();
            const result = builder.CreateNSWNeg(a, 'nswNeg');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });

        test('CreateFreeze produces a valid Value', () => {
            const { builder, fn, a } = makeI32UnOpSetup();
            const result = builder.CreateFreeze(a, 'freeze');
            builder.CreateRet(result);
            expect(result).toBeInstanceOf(llvm.Value);
            expect(llvm.verifyFunction(fn)).toBe(false);
        });
    });

    describe('IR flags are set correctly', () => {
        test('CreateNSWAdd result IR contains nsw flag', () => {
            const { context, theModule, builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNSWAdd(a, b);
            builder.CreateRet(result);
            const ir = theModule.print();
            expect(ir).toContain('nsw');
        });

        test('CreateNUWAdd result IR contains nuw flag', () => {
            const { context, theModule, builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateNUWAdd(a, b);
            builder.CreateRet(result);
            const ir = theModule.print();
            expect(ir).toContain('nuw');
        });

        test('CreateExactSDiv result IR contains exact flag', () => {
            const { context, theModule, builder, fn, a, b } = makeI32BinOpSetup();
            const result = builder.CreateExactSDiv(a, b);
            builder.CreateRet(result);
            const ir = theModule.print();
            expect(ir).toContain('exact');
        });

        test('CreateFreeze result IR contains freeze instruction', () => {
            const { context, theModule, builder, fn, a } = makeI32UnOpSetup();
            const result = builder.CreateFreeze(a);
            builder.CreateRet(result);
            const ir = theModule.print();
            expect(ir).toContain('freeze');
        });
    });
});
