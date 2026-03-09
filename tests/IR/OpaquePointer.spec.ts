import llvm from '../..';

describe('Test Opaque Pointer (LLVM 18)', () => {
    test('getInt8PtrTy returns a pointer type', () => {
        const context = new llvm.LLVMContext();
        const ptr = llvm.Type.getInt8PtrTy(context);
        expect(ptr.isPointerTy()).toBe(true);
    });

    test('typed ptr factory methods all return pointer types', () => {
        const context = new llvm.LLVMContext();
        const ptr8 = llvm.Type.getInt8PtrTy(context);
        const ptr32 = llvm.Type.getInt32PtrTy(context);
        const ptr64 = llvm.Type.getInt64PtrTy(context);
        expect(ptr8.isPointerTy()).toBe(true);
        expect(ptr32.isPointerTy()).toBe(true);
        expect(ptr64.isPointerTy()).toBe(true);
    });

    test('two pointer types from the same factory call are the same type', () => {
        const context = new llvm.LLVMContext();
        const ptrA = llvm.Type.getInt8PtrTy(context);
        const ptrB = llvm.Type.getInt8PtrTy(context);
        expect(llvm.Type.isSameType(ptrA, ptrB)).toBe(true);
    });

    test('pointer type is not the same as integer type', () => {
        const context = new llvm.LLVMContext();
        const ptr = llvm.Type.getInt8PtrTy(context);
        const int32 = llvm.Type.getInt32Ty(context);
        expect(llvm.Type.isSameType(ptr, int32)).toBe(false);
    });
});
