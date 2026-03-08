import fs from 'fs';
import os from 'os';
import path from 'path';
import llvm from '../..';

describe('Test Bitcode Writer (IR fixture)', () => {
    const outputPath = path.join(os.tmpdir(), 'llvm-bindings-writer-test.bc');

    afterEach(() => {
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    });

    test('builds valid IR, writes bitcode, and verifies the output file exists', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('bitcodeWriter', context);
        const builder = new llvm.IRBuilder(context);

        const returnType = builder.getInt32Ty();
        const paramTypes = [builder.getInt32Ty(), builder.getInt32Ty()];
        const functionType = llvm.FunctionType.get(returnType, paramTypes, false);
        const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'writer', module);

        const entryBB = llvm.BasicBlock.Create(context, 'entry');
        builder.SetInsertPoint(entryBB);
        const result = builder.CreateAdd(func.getArg(0), func.getArg(1));
        builder.CreateRet(result);

        expect(llvm.verifyFunction(func)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);

        llvm.WriteBitcodeToFile(module, outputPath);
        expect(fs.existsSync(outputPath)).toBe(true);
    });
});
