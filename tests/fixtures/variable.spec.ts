import llvm from '../..';

describe('Test Variable', () => {
    test('builds and verifies valid IR for alloca/store/load', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('variable', context);
        const builder = new llvm.IRBuilder(context);

        const returnType = builder.getVoidTy();
        const functionType = llvm.FunctionType.get(returnType, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'variable', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);
        const alloca = builder.CreateAlloca(builder.getInt32Ty(), null, 'a');
        builder.CreateStore(builder.getInt32(11), alloca);
        const value = builder.CreateLoad(builder.getInt32Ty(), alloca);
        const cond = builder.CreateICmpSGT(value, builder.getInt32(10), 'cond');
        builder.CreateSelect(cond, builder.getInt32(10), builder.getInt32(20));
        builder.CreateRetVoid();

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
