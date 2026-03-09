import llvm from '../..';

describe('Test Class', () => {
    test('builds and verifies valid IR for a struct constructor', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('class', context);
        const builder = new llvm.IRBuilder(context);

        const elementTypes = [builder.getInt32Ty(), builder.getInt32Ty()];
        const classStructType = llvm.StructType.create(context, elementTypes, 'Person');

        const paramTypes = [llvm.Type.getInt8PtrTy(context)];
        const functionType = llvm.FunctionType.get(builder.getVoidTy(), paramTypes, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'class_Person_constructor', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);

        const thisPtr = func.getArg(0);
        const propertyPtr = builder.CreateGEP(classStructType, thisPtr, [
            builder.getInt32(0),
            builder.getInt32(1)
        ]);
        builder.CreateStore(builder.getInt32(111), propertyPtr);
        builder.CreateRetVoid();

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
