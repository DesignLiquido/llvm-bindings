import llvm from '../..';

describe('Test Exception', () => {
    test('builds and verifies valid IR for a C++ exception throw', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('exception', context);
        const builder = new llvm.IRBuilder(context);

        const i8PtrType = builder.getInt8PtrTy();
        const voidType = builder.getVoidTy();

        const functionType = llvm.FunctionType.get(voidType, false);
        const mainFunc = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'exception', module);

        const allocExceptionFuncType = llvm.FunctionType.get(i8PtrType, [builder.getInt64Ty()], false);
        const allocExceptionFunc = module.getOrInsertFunction('__cxa_allocate_exception', allocExceptionFuncType);
        const throwFuncType = llvm.FunctionType.get(voidType, [i8PtrType, i8PtrType, i8PtrType], false);
        const throwFunc = module.getOrInsertFunction('__cxa_throw', throwFuncType);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', mainFunc);
        builder.SetInsertPoint(entryBB);

        // tinfo must be declared first so we can use its pointer type for the BitCast below.
        // In LLVM 18+, tinfo.getType() returns the opaque `ptr` type.
        const tinfo = new llvm.GlobalVariable(module, builder.getInt8PtrTy(), true, llvm.Function.LinkageTypes.ExternalLinkage, null);

        const errMsgStr = builder.CreateGlobalString('error message');
        const tmp1 = builder.CreateCall(allocExceptionFunc, [builder.getInt64(8)]);
        const tmp2 = builder.CreateBitCast(tmp1, tinfo.getType());
        builder.CreateStore(
            builder.CreateInBoundsGEP(
                errMsgStr.getValueType(),
                errMsgStr,
                [builder.getInt64(0), builder.getInt64(0)]
            ),
            tmp2
        );
        const tmp3 = builder.CreateBitCast(tinfo, builder.getInt8PtrTy());
        builder.CreateCall(throwFunc, [tmp1, tmp3, llvm.ConstantPointerNull.get(builder.getInt8PtrTy())]);
        builder.CreateUnreachable();

        expect(llvm.verifyFunction(mainFunc)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
