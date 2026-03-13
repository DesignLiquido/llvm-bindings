#include "Support/CodeGen.h"
#include <llvm/Support/CodeGen.h>

namespace CodeGen {
    void Init(Napi::Env env, Napi::Object &exports) {
        // Reloc::Model
        Napi::Object relocNS = Napi::Object::New(env);
        relocNS.Set("Static",       Napi::Number::New(env, static_cast<int>(llvm::Reloc::Static)));
        relocNS.Set("PIC_",         Napi::Number::New(env, static_cast<int>(llvm::Reloc::PIC_)));
        relocNS.Set("DynamicNoPIC", Napi::Number::New(env, static_cast<int>(llvm::Reloc::DynamicNoPIC)));
        relocNS.Set("ROPI",         Napi::Number::New(env, static_cast<int>(llvm::Reloc::ROPI)));
        relocNS.Set("RWPI",         Napi::Number::New(env, static_cast<int>(llvm::Reloc::RWPI)));
        relocNS.Set("ROPI_RWPI",    Napi::Number::New(env, static_cast<int>(llvm::Reloc::ROPI_RWPI)));
        exports.Set("Reloc", relocNS);

        // CodeModel::Model
        Napi::Object cmNS = Napi::Object::New(env);
        cmNS.Set("Tiny",   Napi::Number::New(env, static_cast<int>(llvm::CodeModel::Tiny)));
        cmNS.Set("Small",  Napi::Number::New(env, static_cast<int>(llvm::CodeModel::Small)));
        cmNS.Set("Kernel", Napi::Number::New(env, static_cast<int>(llvm::CodeModel::Kernel)));
        cmNS.Set("Medium", Napi::Number::New(env, static_cast<int>(llvm::CodeModel::Medium)));
        cmNS.Set("Large",  Napi::Number::New(env, static_cast<int>(llvm::CodeModel::Large)));
        exports.Set("CodeModel", cmNS);

        // CodeGenOptLevel (exported as CodeGenOpt for JS)
        Napi::Object cgOptNS = Napi::Object::New(env);
        cgOptNS.Set("None",       Napi::Number::New(env, static_cast<int>(llvm::CodeGenOptLevel::None)));
        cgOptNS.Set("Less",       Napi::Number::New(env, static_cast<int>(llvm::CodeGenOptLevel::Less)));
        cgOptNS.Set("Default",    Napi::Number::New(env, static_cast<int>(llvm::CodeGenOptLevel::Default)));
        cgOptNS.Set("Aggressive", Napi::Number::New(env, static_cast<int>(llvm::CodeGenOptLevel::Aggressive)));
        exports.Set("CodeGenOpt", cgOptNS);

        // CodeGenFileType
        Napi::Object cgFileTypeNS = Napi::Object::New(env);
        cgFileTypeNS.Set("Assembly", Napi::Number::New(env, static_cast<int>(llvm::CodeGenFileType::AssemblyFile)));
        cgFileTypeNS.Set("Object",   Napi::Number::New(env, static_cast<int>(llvm::CodeGenFileType::ObjectFile)));
        cgFileTypeNS.Set("Null",     Napi::Number::New(env, static_cast<int>(llvm::CodeGenFileType::Null)));
        exports.Set("CodeGenFileType", cgFileTypeNS);
    }
}
