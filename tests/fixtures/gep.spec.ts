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

    test('CreateInBoundsGEP with nuw=true emits nuw flag in IR', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('gepNuw', context);
        const builder = new llvm.IRBuilder(context);

        const i32Ty = llvm.Type.getInt32Ty(context);
        const arrTy = llvm.ArrayType.get(i32Ty, 4);
        const ptrTy = llvm.PointerType.get(context, 0);
        const fnType = llvm.FunctionType.get(ptrTy, [ptrTy], false);
        const func = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'gepNuw', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);

        const ptr = func.getArg(0);
        const idx = builder.getInt32(1);
        const gep = builder.CreateInBoundsGEP(arrTy, ptr, [builder.getInt32(0), idx], 'gepNuw', true);
        builder.CreateRet(gep);

        expect(llvm.verifyFunction(func)).toBe(false);
        const ir = module.print();
        expect(ir).toContain('nuw');
    });
});
