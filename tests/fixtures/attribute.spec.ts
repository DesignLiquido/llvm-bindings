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
        const inRegAttr = llvm.Attribute.get(context, llvm.Attribute.AttrKind.InReg);
        func.addFnAttr(noInlineAttr);
        func.addParamAttr(0, inRegAttr);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);
        const result = builder.CreateAdd(func.getArg(0), func.getArg(1));
        builder.CreateRet(result);

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });

    test('creates integer and type attributes', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('attributeValues', context);
        const builder = new llvm.IRBuilder(context);
        const pairType = llvm.StructType.create(context, [builder.getInt32Ty(), builder.getInt32Ty()], 'Pair');

        const functionType = llvm.FunctionType.get(builder.getVoidTy(), [builder.getPtrTy(), builder.getPtrTy()], false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'takesPointers', module);
        func.addParamAttr(0, llvm.Attribute.get(context, llvm.Attribute.AttrKind.Dereferenceable, 8));
        func.addParamAttr(0, llvm.Attribute.get(context, llvm.Attribute.AttrKind.Alignment, 16));
        func.addParamAttr(1, llvm.Attribute.get(context, llvm.Attribute.AttrKind.ByVal, pairType));

        expect(llvm.verifyModule(module)).toBe(false);
        const ir = module.print();
        expect(ir).toContain('declare void @takesPointers(ptr align 16 dereferenceable(8), ptr byval(%Pair))');
    });

    test('rejects a value that does not match the attribute kind', () => {
        const context = new llvm.LLVMContext();
        const i32 = llvm.Type.getInt32Ty(context);
        const invalidKind = 'The attribute kind parameter is invalid';
        // enum attribute with a value
        expect(() => llvm.Attribute.get(context, llvm.Attribute.AttrKind.InReg, i32)).toThrow(invalidKind);
        expect(() => llvm.Attribute.get(context, llvm.Attribute.AttrKind.NoInline, 1)).toThrow(invalidKind);
        // int attribute without a number / with a type
        expect(() => llvm.Attribute.get(context, llvm.Attribute.AttrKind.Alignment)).toThrow(invalidKind);
        expect(() => llvm.Attribute.get(context, llvm.Attribute.AttrKind.Alignment, i32)).toThrow(invalidKind);
        // type attribute with a number
        expect(() => llvm.Attribute.get(context, llvm.Attribute.AttrKind.ByVal, 4)).toThrow(invalidKind);
    });
});
