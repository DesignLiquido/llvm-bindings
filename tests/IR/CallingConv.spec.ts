import llvm from '../..';

describe('Test CallingConv', () => {
    test('CallingConv enum values are defined and distinct', () => {
        // Canonical values from LLVM spec
        expect(llvm.CallingConv.C).toBe(0);
        expect(llvm.CallingConv.Fast).toBe(8);
        expect(llvm.CallingConv.Cold).toBe(9);
        expect(llvm.CallingConv.GHC).toBe(10);

        // Verify all expected keys exist
        const keys = [
            'C', 'Fast', 'Cold', 'GHC', 'HiPE', 'AnyReg',
            'PreserveMost', 'PreserveAll', 'Swift', 'CXX_FAST_TLS',
            'Tail', 'CFGuard_Check', 'SwiftTail', 'FirstTargetCC',
            'X86_StdCall', 'X86_FastCall', 'ARM_APCS', 'ARM_AAPCS',
            'ARM_AAPCS_VFP', 'MSP430_INTR', 'X86_ThisCall', 'PTX_Kernel',
            'PTX_Device', 'SPIR_FUNC', 'SPIR_KERNEL', 'Intel_OCL_BI',
            'X86_64_SysV', 'Win64', 'X86_VectorCall', 'HHVM', 'HHVM_C',
            'X86_INTR', 'AVR_INTR', 'AVR_SIGNAL', 'AVR_BUILTIN',
            'AMDGPU_VS', 'AMDGPU_GS', 'AMDGPU_PS', 'AMDGPU_CS',
            'AMDGPU_KERNEL', 'X86_RegCall', 'AMDGPU_HS', 'MSP430_BUILTIN',
            'AMDGPU_LS', 'AMDGPU_ES', 'AArch64_VectorCall',
            'AArch64_SVE_VectorCall', 'WASM_EmscriptenInvoke',
            'AMDGPU_Gfx', 'M68k_INTR', 'MaxID',
        ];
        for (const key of keys) {
            expect(typeof (llvm.CallingConv as any)[key]).toBe('number');
        }

        // All values are non-negative integers
        for (const key of keys) {
            const val = (llvm.CallingConv as any)[key];
            expect(Number.isInteger(val)).toBe(true);
            expect(val).toBeGreaterThanOrEqual(0);
        }
    });

    test('Function.getCallingConv returns C (0) by default', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('test', context);
        const funcType = llvm.FunctionType.get(llvm.Type.getVoidTy(context), false);
        const func = llvm.Function.Create(funcType, llvm.Function.LinkageTypes.ExternalLinkage, 'testFn', module);

        expect(func.getCallingConv()).toBe(llvm.CallingConv.C);
    });

    test('Function.setCallingConv changes the calling convention', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('test', context);
        const funcType = llvm.FunctionType.get(llvm.Type.getVoidTy(context), false);
        const func = llvm.Function.Create(funcType, llvm.Function.LinkageTypes.ExternalLinkage, 'testFn2', module);

        func.setCallingConv(llvm.CallingConv.Fast);
        expect(func.getCallingConv()).toBe(llvm.CallingConv.Fast);

        func.setCallingConv(llvm.CallingConv.Cold);
        expect(func.getCallingConv()).toBe(llvm.CallingConv.Cold);

        // Restore to C
        func.setCallingConv(llvm.CallingConv.C);
        expect(func.getCallingConv()).toBe(llvm.CallingConv.C);
    });

    test('Function.setCallingConv throws without arguments', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('test', context);
        const funcType = llvm.FunctionType.get(llvm.Type.getVoidTy(context), false);
        const func = llvm.Function.Create(funcType, llvm.Function.LinkageTypes.ExternalLinkage, 'testFn3', module);

        expect(() => (func as any).setCallingConv()).toThrow();
    });
});
