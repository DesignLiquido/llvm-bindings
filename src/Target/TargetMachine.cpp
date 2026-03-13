#include "Target/index.h"
#include "IR/index.h"
#include "Util/index.h"
#include <llvm/IR/LegacyPassManager.h>
#include <llvm/Support/CodeGen.h>
#include <llvm/Support/FileSystem.h>
#include <llvm/Support/raw_ostream.h>
#include <llvm/ADT/SmallVector.h>

void TargetMachine::Init(Napi::Env env, Napi::Object &exports) {
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "TargetMachine", {
            InstanceMethod("createDataLayout", &TargetMachine::createDataLayout),
            InstanceMethod("emitToFile",       &TargetMachine::emitToFile),
            InstanceMethod("emitToBuffer",     &TargetMachine::emitToBuffer)
    });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("TargetMachine", func);
}

Napi::Object TargetMachine::New(Napi::Env env, llvm::TargetMachine *machine) {
    return constructor.New({Napi::External<llvm::TargetMachine>::New(env, machine)});
}

bool TargetMachine::IsClassOf(const Napi::Value &value) {
    return value.IsNull() || value.As<Napi::Object>().InstanceOf(constructor.Value());
}

TargetMachine::TargetMachine(const Napi::CallbackInfo &info) : ObjectWrap(info) {
    Napi::Env env = info.Env();
    if (info.IsConstructCall() && info.Length() == 1 && info[0].IsExternal()) {
        auto external = info[0].As<Napi::External<llvm::TargetMachine>>();
        targetMachine = external.Data();
        return;
    }
    throw Napi::TypeError::New(env, ErrMsg::Class::TargetMachine::constructor);
}

Napi::Value TargetMachine::createDataLayout(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    const llvm::DataLayout &dataLayout = targetMachine->createDataLayout();
    return DataLayout::New(env, const_cast<llvm::DataLayout *>(&dataLayout));
}

void TargetMachine::emitToFile(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() < 3 || !Module::IsClassOf(info[0]) || !info[1].IsString() || !info[2].IsNumber()) {
        throw Napi::TypeError::New(env, "emitToFile requires (Module, string, number)");
    }
    llvm::Module *module = Module::Extract(info[0]);
    std::string path = info[1].As<Napi::String>();
    auto fileType = static_cast<llvm::CodeGenFileType>(info[2].As<Napi::Number>().Uint32Value());

    std::error_code ec;
    llvm::raw_fd_ostream dest(path, ec, llvm::sys::fs::OF_None);
    if (ec) {
        throw Napi::Error::New(env, "Could not open file: " + ec.message());
    }

    llvm::legacy::PassManager pass;
    if (targetMachine->addPassesToEmitFile(pass, dest, nullptr, fileType)) {
        throw Napi::Error::New(env, "Target machine can't emit a file of this type");
    }
    pass.run(*module);
    dest.flush();
}

Napi::Value TargetMachine::emitToBuffer(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() < 2 || !Module::IsClassOf(info[0]) || !info[1].IsNumber()) {
        throw Napi::TypeError::New(env, "emitToBuffer requires (Module, number)");
    }
    llvm::Module *module = Module::Extract(info[0]);
    auto fileType = static_cast<llvm::CodeGenFileType>(info[1].As<Napi::Number>().Uint32Value());

    llvm::SmallVector<char, 0> buffer;
    llvm::raw_svector_ostream dest(buffer);

    llvm::legacy::PassManager pass;
    if (targetMachine->addPassesToEmitFile(pass, dest, nullptr, fileType)) {
        throw Napi::Error::New(env, "Target machine can't emit a file of this type");
    }
    pass.run(*module);

    return Napi::Buffer<char>::Copy(env, buffer.data(), buffer.size());
}
