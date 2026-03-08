import llvm from '../..';

describe('Test String', () => {
    test('builds and verifies a module with global strings', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('str', context);
        const builder = new llvm.IRBuilder(context);

        builder.CreateGlobalString('HelloWorld', 'str', 0, module);
        builder.CreateGlobalStringPtr('Bye Bye', 'str', 0, module);

        expect(llvm.verifyModule(module)).toBe(false);
    });
});
