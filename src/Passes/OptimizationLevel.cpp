#include "Passes/OptimizationLevel.h"
#include <llvm/Passes/OptimizationLevel.h>

namespace OptimizationLevel {
    void Init(Napi::Env env, Napi::Object &exports) {
        Napi::Object ns = Napi::Object::New(env);
        // Numeric values matching llvm::OptimizationLevel ordering (0-5)
        ns.Set("O0", Napi::Number::New(env, 0));
        ns.Set("O1", Napi::Number::New(env, 1));
        ns.Set("O2", Napi::Number::New(env, 2));
        ns.Set("O3", Napi::Number::New(env, 3));
        ns.Set("Os", Napi::Number::New(env, 4));
        ns.Set("Oz", Napi::Number::New(env, 5));
        exports.Set("OptimizationLevel", ns);
    }
}
