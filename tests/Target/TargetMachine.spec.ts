import llvm from '../..';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Build a minimal valid module targeting x86_64
function buildFibonacciModule(context: llvm.LLVMContext): llvm.Module {
    const module = new llvm.Module('fibonacci', context);
    const builder = new llvm.IRBuilder(context);

    const i32 = llvm.Type.getInt32Ty(context);
    const funcType = llvm.FunctionType.get(i32, [i32], false);
    const func = llvm.Function.Create(
        funcType,
        llvm.Function.LinkageTypes.ExternalLinkage,
        'fibonacci',
        module,
    );

    const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
    const thenBB = llvm.BasicBlock.Create(context, 'then', func);
    const elseBB = llvm.BasicBlock.Create(context, 'else', func);

    builder.SetInsertPoint(entryBB);
    const cond = builder.CreateICmpULE(func.getArg(0), builder.getInt32(1), 'cond');
    builder.CreateCondBr(cond, thenBB, elseBB);

    builder.SetInsertPoint(thenBB);
    builder.CreateRet(func.getArg(0));

    builder.SetInsertPoint(elseBB);
    const n1 = builder.CreateSub(func.getArg(0), builder.getInt32(1), 'n1');
    const n2 = builder.CreateSub(func.getArg(0), builder.getInt32(2), 'n2');
    const r1 = builder.CreateCall(func, [n1], 'r1');
    const r2 = builder.CreateCall(func, [n2], 'r2');
    builder.CreateRet(builder.CreateAdd(r1, r2));

    return module;
}

describe('Test TargetMachine', () => {
    let target: llvm.Target | null = null;
    let machine: llvm.TargetMachine | undefined;

    beforeAll(() => {
        llvm.InitializeAllTargetInfos();
        llvm.InitializeAllTargets();
        llvm.InitializeAllTargetMCs();
        llvm.InitializeAllAsmPrinters();
        target = llvm.TargetRegistry.lookupTarget('x86_64');
        if (target) {
            machine = target.createTargetMachine('x86_64-unknown-unknown', 'generic');
        }
    });

    test('Test llvm.TargetMachine.createDataLayout', () => {
        expect(target).toBeInstanceOf(llvm.Target);
        if (target) {
            const dataLayout = machine!.createDataLayout();
            expect(dataLayout).toBeInstanceOf(llvm.DataLayout);
        }
    });

    test('Test llvm.Target.createTargetMachine with Reloc and CodeModel', () => {
        expect(target).toBeInstanceOf(llvm.Target);
        if (target) {
            const m = target.createTargetMachine(
                'x86_64-unknown-unknown', 'generic', '',
                llvm.Reloc.PIC_,
                llvm.CodeModel.Small,
                llvm.CodeGenOpt.Default,
            );
            expect(m).toBeInstanceOf(llvm.TargetMachine);
            expect(m.createDataLayout()).toBeInstanceOf(llvm.DataLayout);
        }
    });

    test('Test llvm.TargetMachine.emitToBuffer produces non-empty object code', () => {
        expect(target).toBeInstanceOf(llvm.Target);
        if (!target || !machine) return;

        const context = new llvm.LLVMContext();
        const module = buildFibonacciModule(context);
        module.setTargetTriple('x86_64-unknown-unknown');
        module.setDataLayout(machine.createDataLayout());

        const buf = machine.emitToBuffer(module, llvm.CodeGenFileType.Object);
        expect(buf).toBeInstanceOf(Buffer);
        expect(buf.length).toBeGreaterThan(0);
    });

    test('Test llvm.TargetMachine.emitToFile produces a non-empty file', () => {
        expect(target).toBeInstanceOf(llvm.Target);
        if (!target || !machine) return;

        const context = new llvm.LLVMContext();
        const module = buildFibonacciModule(context);
        module.setTargetTriple('x86_64-unknown-unknown');
        module.setDataLayout(machine.createDataLayout());

        const outPath = path.join(os.tmpdir(), `llvm-bindings-test-${process.pid}.o`);
        try {
            machine.emitToFile(module, outPath, llvm.CodeGenFileType.Object);
            expect(fs.existsSync(outPath)).toBe(true);
            const stat = fs.statSync(outPath);
            expect(stat.size).toBeGreaterThan(0);
        } finally {
            if (fs.existsSync(outPath)) {
                fs.unlinkSync(outPath);
            }
        }
    });

    test('Test emitToBuffer throws without required arguments', () => {
        if (!machine) return;
        expect(() => (machine as any).emitToBuffer()).toThrow();
    });

    test('Test emitToFile throws with invalid output path', () => {
        if (!machine || !target) return;
        const context = new llvm.LLVMContext();
        const module = buildFibonacciModule(context);
        const invalidPath = path.join(os.tmpdir(), 'nonexistent-llvm-subdir-xyz', 'out.o');
        expect(() =>
            machine!.emitToFile(module, invalidPath, llvm.CodeGenFileType.Object),
        ).toThrow();
    });
});
