import llvm from '../..';

describe('Test Attribute', () => {
    test('builds and verifies valid IR with function and parameter attributes', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('attribute', context);
        const builder = new llvm.IRBuilder(context);

        const returnType = builder.getInt32Ty();
        const paramTypes = [builder.getInt32Ty(), builder.getInt32Ty()];
        const functionType = llvm.FunctionType.get(returnType, paramTypes, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'addWithAttributes', module);

        const noInlineAttr = llvm.Attribute.get(context, llvm.Attribute.AttrKind.NoInline);
        const inRegAttr = llvm.Attribute.get(context, llvm.Attribute.AttrKind.InReg, builder.getInt32Ty());
        func.addFnAttr(noInlineAttr);
        func.addParamAttr(0, inRegAttr);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);
        const result = builder.CreateAdd(func.getArg(0), func.getArg(1));
        builder.CreateRet(result);

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
