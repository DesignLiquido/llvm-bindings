import llvm from '../..';

describe('Test StructType.create with isPacked', () => {
    test('StructType.create without isPacked creates unpacked struct', () => {
        const context = new llvm.LLVMContext();
        const i8 = llvm.Type.getInt8Ty(context);
        const i32 = llvm.Type.getInt32Ty(context);

        const st = llvm.StructType.create(context, [i8, i32], 'MyStruct');
        expect(st).toBeInstanceOf(llvm.StructType);
        expect(st.isPacked()).toBe(false);
        expect(st.getName()).toBe('MyStruct');
    });

    test('StructType.create with isPacked=true creates packed struct', () => {
        const context = new llvm.LLVMContext();
        const i8 = llvm.Type.getInt8Ty(context);
        const i32 = llvm.Type.getInt32Ty(context);

        const st = llvm.StructType.create(context, [i8, i32], 'PackedStruct', true);
        expect(st).toBeInstanceOf(llvm.StructType);
        expect(st.isPacked()).toBe(true);
        expect(st.getName()).toBe('PackedStruct');
    });

    test('StructType.create with isPacked=false is equivalent to omitting it', () => {
        const context = new llvm.LLVMContext();
        const i32 = llvm.Type.getInt32Ty(context);

        const st = llvm.StructType.create(context, [i32], 'UnpackedExplicit', false);
        expect(st.isPacked()).toBe(false);
    });

    test('StructType.create with name only still works', () => {
        const context = new llvm.LLVMContext();
        const st = llvm.StructType.create(context, 'NameOnly');
        expect(st).toBeInstanceOf(llvm.StructType);
        expect(st.getName()).toBe('NameOnly');
        expect(st.isOpaque()).toBe(true);
    });
});
