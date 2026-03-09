import llvm from '../..';

describe('Test Intrinsic', () => {
    test('builds and verifies valid IR using intrinsic declarations', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('intrinsic', context);
        const builder = new llvm.IRBuilder(context);

        const functionType = llvm.FunctionType.get(builder.getVoidTy(), false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'intrinsic', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);

        const debugtrapFn = llvm.Intrinsic.getDeclaration(module, llvm.Intrinsic.debugtrap);
        builder.CreateCall(debugtrapFn, []);

        llvm.Intrinsic.getDeclaration(module, llvm.Intrinsic.memmove, [
            builder.getInt8PtrTy(),
            builder.getInt8PtrTy(),
            builder.getInt32Ty()
        ]);

        builder.CreateRetVoid();

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
