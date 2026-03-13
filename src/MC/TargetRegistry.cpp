#include "MC/index.h"
#include "Target/index.h"
#include "Util/index.h"
#include <llvm/Support/CodeGen.h>
#include <optional>

//===----------------------------------------------------------------------===//
//                        Target Class
//===----------------------------------------------------------------------===//

void Target::Init(Napi::Env env, Napi::Object &exports) {
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "Target", {
            InstanceMethod("createTargetMachine", &Target::createTargetMachine),
            InstanceMethod("getName", &Target::getName),
            InstanceMethod("getShortDescription", &Target::getShortDescription)
    });
    constructor = Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Target", func);
}

Napi::Object Target::New(Napi::Env env, llvm::Target *target) {
    return constructor.New({Napi::External<llvm::Target>::New(env, target)});
}

Target::Target(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Target>{info} {
    Napi::Env env = info.Env();
    if (info.IsConstructCall() && info.Length() == 1 && info[0].IsExternal()) {
        auto external = info[0].As<Napi::External<llvm::Target>>();
        target = external.Data();
        return;
    }
    throw Napi::TypeError::New(env, ErrMsg::Class::Target::constructor);
}

Napi::Value Target::createTargetMachine(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    unsigned argsLen = info.Length();
    // Overloads:
    //   (triple, cpu)
    //   (triple, cpu, features)
    //   (triple, cpu, features, reloc)
    //   (triple, cpu, features, reloc, codeModel)
    //   (triple, cpu, features, reloc, codeModel, optLevel)
    //   (triple, cpu, features, reloc, codeModel, optLevel, jit)
    if (argsLen < 2 || !info[0].IsString() || !info[1].IsString() ||
        argsLen >= 3 && !info[2].IsString() ||
        argsLen >= 4 && !info[3].IsNumber() ||
        argsLen >= 5 && !info[4].IsNumber() ||
        argsLen >= 6 && !info[5].IsNumber() ||
        argsLen >= 7 && !info[6].IsBoolean()) {
        throw Napi::TypeError::New(env, ErrMsg::Class::Target::createTargetMachine);
    }
    std::string targetTriple = info[0].As<Napi::String>();
    std::string cpu = info[1].As<Napi::String>();
    std::string features;
    if (argsLen >= 3) {
        features = info[2].As<Napi::String>();
    }
    llvm::TargetOptions options{};
    std::optional<llvm::Reloc::Model> relocModel;
    std::optional<llvm::CodeModel::Model> codeModel;
    llvm::CodeGenOptLevel optLevel = llvm::CodeGenOptLevel::Default;
    bool jit = false;
    if (argsLen >= 4) {
        relocModel = static_cast<llvm::Reloc::Model>(info[3].As<Napi::Number>().Uint32Value());
    }
    if (argsLen >= 5) {
        codeModel = static_cast<llvm::CodeModel::Model>(info[4].As<Napi::Number>().Uint32Value());
    }
    if (argsLen >= 6) {
        optLevel = static_cast<llvm::CodeGenOptLevel>(info[5].As<Napi::Number>().Uint32Value());
    }
    if (argsLen >= 7) {
        jit = info[6].As<Napi::Boolean>().Value();
    }
    llvm::TargetMachine *targetMachinePtr = target->createTargetMachine(
        llvm::Triple(targetTriple), cpu, features, options, relocModel, codeModel, optLevel, jit);
    return TargetMachine::New(env, targetMachinePtr);
}

Napi::Value Target::getName(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, target->getName());
}

Napi::Value Target::getShortDescription(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    return Napi::String::New(env, target->getShortDescription());
}

//===----------------------------------------------------------------------===//
//                        TargetRegistry Namespace
//===----------------------------------------------------------------------===//

// TODO: implement class TargetRegistry

static Napi::Value lookupTarget(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() == 1 && info[0].IsString()) {
        std::string triple = info[0].As<Napi::String>();
        std::string error;
        const llvm::Target *result = llvm::TargetRegistry::lookupTarget(triple, error);
        if (result) {
            return Target::New(env, const_cast<llvm::Target *>(result));
        } else {
            llvm::errs() << error + '\n';
            return env.Null();
        }
    }
    throw Napi::TypeError::New(env, ErrMsg::Class::TargetRegistry::lookupTarget);
}

void InitTargetRegistry(Napi::Env env, Napi::Object &exports) {
    Napi::Object targetRegistryNS = Napi::Object::New(env);
    targetRegistryNS.Set("lookupTarget", Napi::Function::New(env, lookupTarget));
    exports.Set("TargetRegistry", targetRegistryNS);
}
