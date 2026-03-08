import llvm from '../..';

describe('Test Add', () => {
    test('builds and verifies valid IR for an add function', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('add', context);
        const builder = new llvm.IRBuilder(context);

        const returnType = builder.getInt32Ty();
        const paramTypes = [builder.getInt32Ty(), builder.getInt32Ty()];
        const functionType = llvm.FunctionType.get(returnType, paramTypes, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'add', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);
        const paramA = func.getArg(0);
        const paramB = func.getArg(1);
        const result = builder.CreateAdd(paramA, paramB);
        builder.CreateRet(result);

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
