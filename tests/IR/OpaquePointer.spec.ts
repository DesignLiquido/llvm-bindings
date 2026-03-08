import llvm from '../..';

describe('Test Opaque Pointer (LLVM 17)', () => {
    test('PointerType.getUnqual returns a pointer type', () => {
        const context = new llvm.LLVMContext();
        const ptr = llvm.PointerType.getUnqual(llvm.Type.getInt8Ty(context));
        expect(ptr.isPointerTy()).toBe(true);
    });

    test('PointerType.get(type, addrSpace) returns a pointer type', () => {
        const context = new llvm.LLVMContext();
        const ptr = llvm.PointerType.get(llvm.Type.getInt8Ty(context), 0);
        expect(ptr.isPointerTy()).toBe(true);
    });

    test('getUnqual, get(AS0), and getInt8PtrTy all resolve to the same type', () => {
        const context = new llvm.LLVMContext();
        const a = llvm.PointerType.getUnqual(llvm.Type.getInt8Ty(context));
        const b = llvm.PointerType.get(llvm.Type.getInt8Ty(context), 0);
        const c = llvm.Type.getInt8PtrTy(context);
        expect(llvm.Type.isSameType(a, b)).toBe(true);
        expect(llvm.Type.isSameType(a, c)).toBe(true);
    });

    test('pointers in different address spaces are both pointer types', () => {
        const context = new llvm.LLVMContext();
        const as0 = llvm.PointerType.get(llvm.Type.getInt8Ty(context), 0);
        const as1 = llvm.PointerType.get(llvm.Type.getInt8Ty(context), 1);
        expect(as0.isPointerTy()).toBe(true);
        expect(as1.isPointerTy()).toBe(true);
        // Note: isSameType does not currently compare address spaces for opaque
        // pointers — that is a known limitation of the binding's implementation.
    });

    // The following require a binary rebuilt against LLVM 17:
    //   - PointerType.getUnqual(context)   — context overload
    //   - PointerType.get(context, addrSpace) — context overload
    //   - ptr.isOpaque()                   — method not yet registered
});
