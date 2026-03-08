import llvm from '../..';

describe('Test GEP', () => {
    test('builds and verifies valid IR using GetElementPtr', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('gep', context);
        const builder = new llvm.IRBuilder(context);

        const functionType = llvm.FunctionType.get(builder.getVoidTy(), false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'gep', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);

        const strAlloca = builder.CreateAlloca(builder.getInt8PtrTy(), null, 'a');
        const printConst = builder.CreateGlobalString('string content', '.str', 0, module);
        const ptr = builder.CreateGEP(printConst.getValueType(), printConst, [
            builder.getInt64(0),
            builder.getInt64(0),
        ]);
        builder.CreateStore(ptr, strAlloca);
        builder.CreateRetVoid();

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
