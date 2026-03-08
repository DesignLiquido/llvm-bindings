import path from 'path';
import llvm from '../..';

describe('Test Linker', () => {
    test('parses a bitcode file, links it, and verifies the resulting module', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('linker', context);
        const builder = new llvm.IRBuilder(context);

        const bitcodePath = path.join(__dirname, 'bitcode/add.bc');
        const err = new llvm.SMDiagnostic();
        const srcModule = llvm.parseIRFile(bitcodePath, err, context);
        expect(llvm.verifyModule(srcModule)).toBe(false);
        expect(llvm.Linker.linkModules(module, srcModule)).toBe(false);

        const returnType = builder.getInt32Ty();
        const functionType = llvm.FunctionType.get(returnType, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'linker', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
        builder.SetInsertPoint(entryBB);
        const addFunc = module.getFunction('add');
        expect(addFunc).toBeInstanceOf(llvm.Function);
        const retVal = builder.CreateCall(addFunc!, [builder.getInt32(1), builder.getInt32(2)]);
        builder.CreateRet(retVal);

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
