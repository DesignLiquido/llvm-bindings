#include "IR/PassManager.h"
#include "IR/index.h"
#include "Passes/index.h"
#include "Util/index.h"
#include <llvm/Passes/OptimizationLevel.h>
#include <llvm/Transforms/Scalar/SROA.h>
#include <llvm/Transforms/Scalar/EarlyCSE.h>
#include <llvm/Transforms/InstCombine/InstCombine.h>
#include <llvm/IR/Verifier.h>

//===----------------------------------------------------------------------===//
//                        FunctionPassManager Class
//===----------------------------------------------------------------------===//

void FunctionPassManager::Init(Napi::Env env, Napi::Object &exports) {
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "FunctionPassManager", {
            InstanceMethod("addSROAPass",        &FunctionPassManager::addSROAPass),
            InstanceMethod("addEarlyCSEPass",    &FunctionPassManager::addEarlyCSEPass),
            InstanceMethod("addInstCombinePass", &FunctionPassManager::addInstCombinePass),
            InstanceMethod("isEmpty",            &FunctionPassManager::isEmpty)
    });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("FunctionPassManager", func);
}

bool FunctionPassManager::IsClassOf(const Napi::Value &value) {
    return value.IsNull() || value.As<Napi::Object>().InstanceOf(constructor.Value());
}

Napi::Object FunctionPassManager::New(Napi::Env env, llvm::FunctionPassManager fpm) {
    Napi::Object obj = constructor.New({});
    FunctionPassManager *wrapper = Unwrap(obj);
    wrapper->fpm = std::move(fpm);
    return obj;
}

FunctionPassManager::FunctionPassManager(const Napi::CallbackInfo &info) : ObjectWrap(info) {
    Napi::Env env = info.Env();
    if (!info.IsConstructCall()) {
        throw Napi::TypeError::New(env, "FunctionPassManager must be called with new");
    }
}

llvm::FunctionPassManager &FunctionPassManager::getLLVMPrimitive() {
    return fpm;
}

void FunctionPassManager::addSROAPass(const Napi::CallbackInfo &info) {
    fpm.addPass(llvm::SROAPass(llvm::SROAOptions::ModifyCFG));
}

void FunctionPassManager::addEarlyCSEPass(const Napi::CallbackInfo &info) {
    bool useSSA = false;
    if (info.Length() >= 1 && info[0].IsBoolean()) {
        useSSA = info[0].As<Napi::Boolean>();
    }
    fpm.addPass(llvm::EarlyCSEPass(useSSA));
}

void FunctionPassManager::addInstCombinePass(const Napi::CallbackInfo &info) {
    fpm.addPass(llvm::InstCombinePass());
}

Napi::Value FunctionPassManager::isEmpty(const Napi::CallbackInfo &info) {
    return Napi::Boolean::New(info.Env(), fpm.isEmpty());
}

//===----------------------------------------------------------------------===//
//                        ModulePassManager Class
//===----------------------------------------------------------------------===//

// Maps our numeric OptimizationLevel values (0-5) to llvm::OptimizationLevel
static llvm::OptimizationLevel toOptimizationLevel(unsigned level) {
    switch (level) {
        case 0: return llvm::OptimizationLevel::O0;
        case 1: return llvm::OptimizationLevel::O1;
        case 2: return llvm::OptimizationLevel::O2;
        case 3: return llvm::OptimizationLevel::O3;
        case 4: return llvm::OptimizationLevel::Os;
        case 5: return llvm::OptimizationLevel::Oz;
        default: return llvm::OptimizationLevel::O0;
    }
}

void ModulePassManager::Init(Napi::Env env, Napi::Object &exports) {
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "ModulePassManager", {
            InstanceMethod("createFunctionPassManager", &ModulePassManager::createFunctionPassManager),
            InstanceMethod("addFunctionPasses",         &ModulePassManager::addFunctionPasses),
            InstanceMethod("addVerifierPass",           &ModulePassManager::addVerifierPass),
            InstanceMethod("isEmpty",                   &ModulePassManager::isEmpty),
            InstanceMethod("run",                       &ModulePassManager::run)
    });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("ModulePassManager", func);
}

ModulePassManager::ModulePassManager(const Napi::CallbackInfo &info) : ObjectWrap(info) {
    Napi::Env env = info.Env();
    if (!info.IsConstructCall()) {
        throw Napi::TypeError::New(env, "ModulePassManager must be called with new");
    }

    unsigned level = 0;
    if (info.Length() >= 1 && info[0].IsNumber()) {
        level = info[0].As<Napi::Number>().Uint32Value();
    }
    optLevel = toOptimizationLevel(level);

    // Register all analysis managers with the PassBuilder
    PB.registerModuleAnalyses(MAM);
    PB.registerCGSCCAnalyses(CGAM);
    PB.registerFunctionAnalyses(FAM);
    PB.registerLoopAnalyses(LAM);
    PB.crossRegisterProxies(LAM, FAM, CGAM, MAM);

    // Build the default pipeline for the requested optimization level
    if (optLevel == llvm::OptimizationLevel::O0) {
        MPM = PB.buildO0DefaultPipeline(optLevel);
    } else {
        MPM = PB.buildPerModuleDefaultPipeline(optLevel);
    }
}

Napi::Value ModulePassManager::createFunctionPassManager(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    unsigned ltoLevel = 0;
    if (info.Length() >= 1 && info[0].IsNumber()) {
        ltoLevel = info[0].As<Napi::Number>().Uint32Value();
    }
    auto ltoPhase = static_cast<llvm::ThinOrFullLTOPhase>(ltoLevel);
    llvm::FunctionPassManager fpm = PB.buildFunctionSimplificationPipeline(optLevel, ltoPhase);
    return FunctionPassManager::New(env, std::move(fpm));
}

void ModulePassManager::addFunctionPasses(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() == 0 || !FunctionPassManager::IsClassOf(info[0])) {
        throw Napi::TypeError::New(env, "Expected FunctionPassManager argument");
    }
    llvm::FunctionPassManager &fpm = FunctionPassManager::Unwrap(info[0].As<Napi::Object>())->getLLVMPrimitive();
    MPM.addPass(llvm::createModuleToFunctionPassAdaptor(std::move(fpm)));
}

void ModulePassManager::addVerifierPass(const Napi::CallbackInfo &info) {
    MPM.addPass(llvm::VerifierPass());
}

Napi::Value ModulePassManager::isEmpty(const Napi::CallbackInfo &info) {
    return Napi::Boolean::New(info.Env(), MPM.isEmpty());
}

void ModulePassManager::run(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() == 0 || !Module::IsClassOf(info[0])) {
        throw Napi::TypeError::New(env, "Expected Module argument");
    }
    llvm::Module *module = Module::Extract(info[0]);
    MPM.run(*module, MAM);
}
