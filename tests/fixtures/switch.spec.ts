import llvm from '../..';

describe('Test Switch', () => {
    test('builds and verifies valid IR for a switch statement', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('switch', context);
        const builder = new llvm.IRBuilder(context);

        const returnType = builder.getInt32Ty();
        const paramTypes = [builder.getInt32Ty()];
        const functionType = llvm.FunctionType.get(returnType, paramTypes, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'switch', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        const case1BB = llvm.BasicBlock.Create(context, 'switch.case1', func);
        const case2BB = llvm.BasicBlock.Create(context, 'switch.case2', func);
        const defaultCaseBB = llvm.BasicBlock.Create(context, 'switch.default', func);
        const exitBB = llvm.BasicBlock.Create(context, 'switch.exit', func);

        builder.SetInsertPoint(entryBB);
        const retPtr = builder.CreateAlloca(builder.getInt32Ty(), null, 'ret');
        const switchInst = builder.CreateSwitch(func.getArg(0), defaultCaseBB, 2);
        switchInst.addCase(builder.getInt32(1), case1BB);
        switchInst.addCase(builder.getInt32(2), case2BB);

        builder.SetInsertPoint(case1BB);
        builder.CreateStore(builder.getInt32(1), retPtr);
        builder.CreateBr(exitBB);

        builder.SetInsertPoint(case2BB);
        builder.CreateStore(builder.getInt32(2), retPtr);
        builder.CreateBr(exitBB);

        builder.SetInsertPoint(defaultCaseBB);
        builder.CreateStore(builder.getInt32(3), retPtr);
        builder.CreateBr(exitBB);

        builder.SetInsertPoint(exitBB);
        const retVal = builder.CreateLoad(builder.getInt32Ty(), retPtr);
        builder.CreateRet(retVal);

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
