import llvm from '../..';

describe('Test Type', () => {
    test('isSameType correctly compares primitive and pointer types', () => {
        const context = new llvm.LLVMContext();

        const int32 = llvm.Type.getInt32Ty(context);
        const int32b = llvm.IntegerType.get(context, 32);
        const int8Ptr = llvm.Type.getInt8PtrTy(context);
        const unqualPtr = llvm.PointerType.getUnqual(llvm.Type.getInt8Ty(context));
        const voidTy = llvm.Type.getVoidTy(context);

        expect(llvm.Type.isSameType(int32, int32b)).toBe(true);
        expect(llvm.Type.isSameType(int32, int8Ptr)).toBe(false);
        expect(llvm.Type.isSameType(int32, unqualPtr)).toBe(false);
        expect(llvm.Type.isSameType(int32, voidTy)).toBe(false);
        expect(llvm.Type.isSameType(int32b, int8Ptr)).toBe(false);
        expect(llvm.Type.isSameType(int32b, unqualPtr)).toBe(false);
        expect(llvm.Type.isSameType(int32b, voidTy)).toBe(false);
        expect(llvm.Type.isSameType(int8Ptr, unqualPtr)).toBe(true);
        expect(llvm.Type.isSameType(int8Ptr, voidTy)).toBe(false);
        expect(llvm.Type.isSameType(unqualPtr, voidTy)).toBe(false);
    });
});
