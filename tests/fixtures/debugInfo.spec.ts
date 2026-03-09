import path from 'path';
import llvm from '../..';

describe('Test Debug Info', () => {
    test('builds and verifies valid IR with DWARF debug information', () => {
        const context = new llvm.LLVMContext();
        const module = new llvm.Module('debugInfo', context);
        const builder = new llvm.IRBuilder(context);

        module.addModuleFlag(llvm.Module.ModFlagBehavior.Warning, 'Debug Info Version', llvm.LLVMConstants.DEBUG_METADATA_VERSION);
        module.addModuleFlag(llvm.Module.ModFlagBehavior.Warning, 'Dwarf Version', llvm.dwarf.LLVMConstants.DWARF_VERSION);

        const diBuilder = new llvm.DIBuilder(module);
        const diFile = diBuilder.createFile('debugInfo.ts', __dirname);
        diBuilder.createCompileUnit(llvm.dwarf.SourceLanguage.DW_LANG_C, diFile, 'llvm-bindings', false, '', 0);
        const diBasicType = diBuilder.createBasicType('int', 32, llvm.dwarf.TypeKind.DW_ATE_float);

        // add function
        const addFuncType = llvm.FunctionType.get(builder.getInt32Ty(), [builder.getInt32Ty(), builder.getInt32Ty()], false);
        const addFunc = llvm.Function.Create(addFuncType, llvm.Function.LinkageTypes.ExternalLinkage, 'add', module);
        const addDIParamTypes = diBuilder.getOrCreateTypeArray([diBasicType, diBasicType, diBasicType]);
        const addDISubroutineType = diBuilder.createSubroutineType(addDIParamTypes);
        const addSubprogram = diBuilder.createFunction(diFile, 'add', '', diFile, 1, addDISubroutineType, 1, llvm.DINode.DIFlags.FlagPrototyped, llvm.DISubprogram.DISPFlags.SPFlagDefinition);
        addFunc.setSubprogram(addSubprogram);
        builder.SetCurrentDebugLocation(new llvm.DebugLoc());

        const addEntry = llvm.BasicBlock.Create(context, 'entry', addFunc);
        builder.SetInsertPoint(addEntry);
        const allocaA = builder.CreateAlloca(builder.getInt32Ty(), null, 'a');
        builder.CreateStore(addFunc.getArg(0), allocaA);
        diBuilder.insertDeclare(allocaA, diBuilder.createParameterVariable(addSubprogram, 'a', 1, diFile, 1, diBasicType), diBuilder.createExpression(), llvm.DILocation.get(context, 1, 0, addSubprogram), builder.GetInsertBlock()!);
        const allocaB = builder.CreateAlloca(builder.getInt32Ty(), null, 'b');
        builder.CreateStore(addFunc.getArg(1), allocaB);
        diBuilder.insertDeclare(allocaB, diBuilder.createParameterVariable(addSubprogram, 'b', 2, diFile, 1, diBasicType), diBuilder.createExpression(), llvm.DILocation.get(context, 1, 0, addSubprogram), builder.GetInsertBlock()!);
        builder.SetCurrentDebugLocation(llvm.DILocation.get(context, 2, 14, addSubprogram));
        builder.CreateRet(builder.CreateAdd(builder.CreateLoad(builder.getInt32Ty(), allocaA), builder.CreateLoad(builder.getInt32Ty(), allocaB)));
        diBuilder.finalizeSubprogram(addSubprogram);

        expect(llvm.verifyFunction(addFunc)).toBe(false);

        // main function
        const mainFuncType = llvm.FunctionType.get(builder.getInt32Ty(), false);
        const mainFunc = llvm.Function.Create(mainFuncType, llvm.Function.LinkageTypes.ExternalLinkage, 'main', module);
        const mainDISubroutineType = diBuilder.createSubroutineType(diBuilder.getOrCreateTypeArray([diBasicType]));
        const mainSubprogram = diBuilder.createFunction(diFile, 'main', '', diFile, 5, mainDISubroutineType, 5, llvm.DINode.DIFlags.FlagPrototyped, llvm.DISubprogram.DISPFlags.SPFlagDefinition);
        mainFunc.setSubprogram(mainSubprogram);
        builder.SetCurrentDebugLocation(new llvm.DebugLoc());

        const mainEntry = llvm.BasicBlock.Create(context, 'entry', mainFunc);
        builder.SetInsertPoint(mainEntry);
        const allocaC = builder.CreateAlloca(builder.getInt32Ty(), null, 'c');
        const storeA = builder.CreateAlloca(builder.getInt32Ty(), null, 'a');
        const storeB = builder.CreateAlloca(builder.getInt32Ty(), null, 'b');
        diBuilder.insertDeclare(storeA, diBuilder.createAutoVariable(mainSubprogram, 'a', diFile, 6, diBasicType), diBuilder.createExpression(), llvm.DILocation.get(context, 6, 9, mainSubprogram), builder.GetInsertBlock()!);
        builder.SetCurrentDebugLocation(llvm.DILocation.get(context, 6, 9, mainSubprogram));
        builder.CreateStore(builder.getInt32(1), storeA);
        diBuilder.insertDeclare(storeB, diBuilder.createAutoVariable(mainSubprogram, 'b', diFile, 7, diBasicType), diBuilder.createExpression(), llvm.DILocation.get(context, 7, 9, mainSubprogram), builder.GetInsertBlock()!);
        builder.SetCurrentDebugLocation(llvm.DILocation.get(context, 7, 9, mainSubprogram));
        builder.CreateStore(builder.getInt32(2), storeB);
        diBuilder.insertDeclare(allocaC, diBuilder.createAutoVariable(mainSubprogram, 'c', diFile, 8, diBasicType), diBuilder.createExpression(), llvm.DILocation.get(context, 8, 9, mainSubprogram), builder.GetInsertBlock()!);
        builder.SetCurrentDebugLocation(llvm.DILocation.get(context, 8, 13, mainSubprogram));
        const callRet = builder.CreateCall(addFunc, [builder.CreateLoad(builder.getInt32Ty(), storeA), builder.CreateLoad(builder.getInt32Ty(), storeB)]);
        builder.CreateStore(callRet, allocaC);
        builder.SetCurrentDebugLocation(llvm.DILocation.get(context, 9, 5, mainSubprogram));
        builder.CreateRet(builder.CreateLoad(builder.getInt32Ty(), allocaC));
        diBuilder.finalizeSubprogram(mainSubprogram);

        diBuilder.finalize();

        expect(llvm.verifyFunction(mainFunc)).toBe(false);
        expect(llvm.verifyModule(module)).toBe(false);
    });
});
