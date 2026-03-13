#pragma once

#include <napi.h>
#include <llvm/IR/PassManager.h>
#include <llvm/Passes/PassBuilder.h>
#include <llvm/Analysis/LoopAnalysisManager.h>
#include <llvm/Analysis/CGSCCPassManager.h>

class FunctionPassManager : public Napi::ObjectWrap<FunctionPassManager> {
public:
    static inline Napi::FunctionReference constructor; // NOLINT

    static void Init(Napi::Env env, Napi::Object &exports);

    static Napi::Object New(Napi::Env env, llvm::FunctionPassManager fpm);

    static bool IsClassOf(const Napi::Value &value);

    explicit FunctionPassManager(const Napi::CallbackInfo &info);

    llvm::FunctionPassManager &getLLVMPrimitive();

private:
    llvm::FunctionPassManager fpm;

    void addSROAPass(const Napi::CallbackInfo &info);
    void addEarlyCSEPass(const Napi::CallbackInfo &info);
    void addInstCombinePass(const Napi::CallbackInfo &info);
    Napi::Value isEmpty(const Napi::CallbackInfo &info);
};

class ModulePassManager : public Napi::ObjectWrap<ModulePassManager> {
public:
    static inline Napi::FunctionReference constructor; // NOLINT

    static void Init(Napi::Env env, Napi::Object &exports);

    explicit ModulePassManager(const Napi::CallbackInfo &info);

private:
    llvm::LoopAnalysisManager LAM;
    llvm::FunctionAnalysisManager FAM;
    llvm::CGSCCAnalysisManager CGAM;
    llvm::ModuleAnalysisManager MAM;
    llvm::PassBuilder PB;
    llvm::ModulePassManager MPM;
    llvm::OptimizationLevel optLevel;

    Napi::Value createFunctionPassManager(const Napi::CallbackInfo &info);
    void addFunctionPasses(const Napi::CallbackInfo &info);
    void addVerifierPass(const Napi::CallbackInfo &info);
    Napi::Value isEmpty(const Napi::CallbackInfo &info);
    void run(const Napi::CallbackInfo &info);
};
