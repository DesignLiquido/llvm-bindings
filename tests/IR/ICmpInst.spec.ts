import llvm from '../..';

describe('ICmpInst', () => {
    function setup() {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('icmpTest', context);
        const builder = new llvm.IRBuilder(context);
        const i32Ty = llvm.Type.getInt32Ty(context);
        const fnType = llvm.FunctionType.get(llvm.Type.getInt1Ty(context), [i32Ty, i32Ty], false);
        const fn = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'cmp', module);
        const entryBB = llvm.BasicBlock.Create(context, 'entry', fn);
        builder.SetInsertPoint(entryBB);
        return { context, module, builder, fn };
    }

    test('getSameSign returns false by default', () => {
        const { builder, fn } = setup();
        const a = fn.getArg(0);
        const b = fn.getArg(1);
        const cmp = builder.CreateICmpSLT(a, b, 'cmp') as llvm.ICmpInst;
        builder.CreateRet(cmp);
        expect(cmp.getSameSign()).toBe(false);
    });

    test('setSameSign(true) sets the samesign flag', () => {
        const { builder, fn } = setup();
        const a = fn.getArg(0);
        const b = fn.getArg(1);
        const cmp = builder.CreateICmpSLT(a, b, 'cmp') as llvm.ICmpInst;
        builder.CreateRet(cmp);
        cmp.setSameSign(true);
        expect(cmp.getSameSign()).toBe(true);
    });

    test('setSameSign(false) clears the samesign flag', () => {
        const { builder, fn } = setup();
        const a = fn.getArg(0);
        const b = fn.getArg(1);
        const cmp = builder.CreateICmpSLT(a, b, 'cmp') as llvm.ICmpInst;
        builder.CreateRet(cmp);
        cmp.setSameSign(true);
        cmp.setSameSign(false);
        expect(cmp.getSameSign()).toBe(false);
    });

    test('samesign flag appears in IR when set', () => {
        const { module, builder, fn } = setup();
        const a = fn.getArg(0);
        const b = fn.getArg(1);
        const cmp = builder.CreateICmpSLT(a, b, 'cmp') as llvm.ICmpInst;
        builder.CreateRet(cmp);
        cmp.setSameSign(true);
        expect(module.print()).toContain('samesign');
    });
});
