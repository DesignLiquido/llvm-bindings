import llvm from '../..';

/**
 * Builds a minimal IR setup with debug info needed to call insertDeclare /
 * insertDbgValueIntrinsic:
 *   - a void(i32) function with a DISubprogram
 *   - an entry basic block containing an alloca for the parameter
 *   - a DILocalVariable for that parameter
 *   - an empty DIExpression
 *   - a DILocation pointing into the function's scope
 */
function buildDebugSetup() {
    const context = new llvm.LLVMContext();
    const theModule = new llvm.Module('DIBuilderTest', context);
    const diBuilder = new llvm.DIBuilder(theModule);

    const diFile = diBuilder.createFile('test.ts', '/src');
    const diCU = diBuilder.createCompileUnit(
        llvm.dwarf.SourceLanguage.DW_LANG_C,
        diFile,
        'llvm-bindings-test',
        false,
        '',
        0
    );

    const builder = new llvm.IRBuilder(context);

    // Build a simple void(i32) function
    const i32Ty = llvm.Type.getInt32Ty(context);
    const fnType = llvm.FunctionType.get(llvm.Type.getVoidTy(context), [i32Ty], false);
    const fn = llvm.Function.Create(fnType, llvm.Function.LinkageTypes.ExternalLinkage, 'testFn', theModule);

    // Attach debug info to the function
    const diIntTy = diBuilder.createBasicType('int', 32, llvm.dwarf.TypeKind.DW_ATE_signed);
    const diParamTypes = diBuilder.getOrCreateTypeArray([diIntTy]);
    const diSubroutineTy = diBuilder.createSubroutineType(diParamTypes);
    const diSubprogram = diBuilder.createFunction(
        diCU,
        'testFn',
        'testFn',
        diFile,
        1,
        diSubroutineTy,
        1,
        llvm.DINode.DIFlags.FlagZero,
        llvm.DISubprogram.DISPFlags.SPFlagDefinition
    );
    fn.setSubprogram(diSubprogram);

    // Build the entry block with an alloca for the parameter
    const entryBB = llvm.BasicBlock.Create(context, 'entry', fn);
    builder.SetInsertPoint(entryBB);
    const storage = builder.CreateAlloca(i32Ty, null, 'x');

    const diVar = diBuilder.createParameterVariable(
        diSubprogram,
        'x',
        1,
        diFile,
        1,
        diIntTy
    );
    const diExpr = diBuilder.createExpression();
    const diLoc = llvm.DILocation.get(context, 1, 0, diSubprogram);

    return { context, theModule, diBuilder, builder, fn, entryBB, storage, diVar, diExpr, diLoc };
}

describe('DIBuilder', () => {
    describe('insertDeclare', () => {
        test('inserts into a BasicBlock and returns an Instruction', () => {
            const { context, theModule, diBuilder, builder, fn, entryBB, storage, diVar, diExpr, diLoc } =
                buildDebugSetup();

            // Add a terminator so the block is valid
            builder.CreateRetVoid();

            const result = diBuilder.insertDeclare(storage, diVar, diExpr, diLoc, entryBB);
            diBuilder.finalize();

            expect(result).toBeInstanceOf(llvm.Instruction);
        });

        test('inserts before an Instruction and returns an Instruction', () => {
            const { theModule, diBuilder, builder, fn, entryBB, storage, diVar, diExpr, diLoc } =
                buildDebugSetup();

            const retInst = builder.CreateRetVoid();

            const result = diBuilder.insertDeclare(storage, diVar, diExpr, diLoc, retInst);
            diBuilder.finalize();

            expect(result).toBeInstanceOf(llvm.Instruction);
        });

        test('throws on wrong argument types', () => {
            const { theModule, diBuilder, builder, entryBB, storage, diVar, diExpr, diLoc } =
                buildDebugSetup();
            builder.CreateRetVoid();

            const insertDeclare = diBuilder.insertDeclare.bind(diBuilder) as any;
            expect(() => insertDeclare()).toThrow();
            expect(() => insertDeclare(storage, diVar, diExpr, diLoc)).toThrow();
        });
    });

    describe('insertDbgValueIntrinsic', () => {
        test('inserts into a BasicBlock and returns an Instruction', () => {
            const { theModule, diBuilder, builder, fn, entryBB, storage, diVar, diExpr, diLoc } =
                buildDebugSetup();

            builder.CreateRetVoid();

            const result = diBuilder.insertDbgValueIntrinsic(storage, diVar, diExpr, diLoc, entryBB);
            diBuilder.finalize();

            expect(result).toBeInstanceOf(llvm.Instruction);
        });

        test('inserts before an Instruction and returns an Instruction', () => {
            const { theModule, diBuilder, builder, fn, entryBB, storage, diVar, diExpr, diLoc } =
                buildDebugSetup();

            const retInst = builder.CreateRetVoid();

            const result = diBuilder.insertDbgValueIntrinsic(storage, diVar, diExpr, diLoc, retInst);
            diBuilder.finalize();

            expect(result).toBeInstanceOf(llvm.Instruction);
        });

        test('throws on wrong argument types', () => {
            const { theModule, diBuilder, builder, storage, diVar, diExpr, diLoc } =
                buildDebugSetup();
            builder.CreateRetVoid();

            const insertDbgValue = diBuilder.insertDbgValueIntrinsic.bind(diBuilder) as any;
            expect(() => insertDbgValue()).toThrow();
            expect(() => insertDbgValue(storage, diVar, diExpr, diLoc)).toThrow();
        });
    });
});
