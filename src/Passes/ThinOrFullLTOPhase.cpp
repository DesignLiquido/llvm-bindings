#include "Passes/ThinOrFullLTOPhase.h"
#include <llvm/Passes/PassBuilder.h>

namespace ThinOrFullLTOPhase {
    void Init(Napi::Env env, Napi::Object &exports) {
        Napi::Object ns = Napi::Object::New(env);
        ns.Set("None",             Napi::Number::New(env, static_cast<int>(llvm::ThinOrFullLTOPhase::None)));
        ns.Set("ThinLTOPreLink",   Napi::Number::New(env, static_cast<int>(llvm::ThinOrFullLTOPhase::ThinLTOPreLink)));
        ns.Set("ThinLTOPostLink",  Napi::Number::New(env, static_cast<int>(llvm::ThinOrFullLTOPhase::ThinLTOPostLink)));
        ns.Set("FullLTOPreLink",   Napi::Number::New(env, static_cast<int>(llvm::ThinOrFullLTOPhase::FullLTOPreLink)));
        ns.Set("FullLTOPostLink",  Napi::Number::New(env, static_cast<int>(llvm::ThinOrFullLTOPhase::FullLTOPostLink)));
        exports.Set("ThinOrFullLTOPhase", ns);
    }
}
