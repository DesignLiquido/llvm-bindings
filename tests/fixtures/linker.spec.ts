import fs from 'fs';
import os from 'os';
import path from 'path';
import llvm from '../..';

describe('Test Linker', () => {
    test('parses a bitcode file, links it, and verifies the resulting module', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('linker', context);
        const builder = new llvm.IRBuilder(context);

        const bitcodePath = path.join(__dirname, 'bitcode/add.bc');
        const err = new llvm.SMDiagnostic();
        const srcModule = llvm.parseIRFile(bitcodePath, err, context)!;
        expect(srcModule).toBeInstanceOf(llvm.Module);
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

    test('links a module with a Linker instance', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('linkerInstance', context);
        const srcModule = llvm.parseIRFile(path.join(__dirname, 'bitcode/add.bc'), new llvm.SMDiagnostic(), context)!;

        const linker = new llvm.Linker(module);
        expect(linker.linkInModule(srcModule)).toBe(false);
        expect(module.getFunction('add')).toBeInstanceOf(llvm.Function);
        expect(llvm.verifyModule(module)).toBe(false);
    });

    test('parseIRFile returns null for a missing file', () => {
        const context = new llvm.LLVMContext();
        const result = llvm.parseIRFile(path.join(__dirname, 'bitcode/does-not-exist.ll'), new llvm.SMDiagnostic(), context);
        expect(result).toBeNull();
    });

    test('parseIRFile returns null for invalid IR', () => {
        const context = new llvm.LLVMContext();
        const invalidPath = path.join(os.tmpdir(), `llvm-bindings-invalid-${process.pid}.ll`);
        fs.writeFileSync(invalidPath, 'this is not LLVM IR');
        try {
            expect(llvm.parseIRFile(invalidPath, new llvm.SMDiagnostic(), context)).toBeNull();
        } finally {
            fs.unlinkSync(invalidPath);
        }
    });

    test('parseIRFile validates its arguments', () => {
        const context = new llvm.LLVMContext();
        // Wrong argument order. Both classes look the same to TypeScript, so this compiles.
        expect(() => llvm.parseIRFile('x.ll', context, new llvm.SMDiagnostic())).toThrow('parseIRFile needs to be called with');
    });
});
