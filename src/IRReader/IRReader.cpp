#include "IRReader/index.h"
#include "IR/index.h"
#include "Support/index.h"
#include "Util/index.h"
#include <llvm/Support/raw_ostream.h>

Napi::Value parseIRFile(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() >= 3 &&
        info[0].IsString() &&
        SMDiagnostic::IsClassOf(info[1]) &&
        LLVMContext::IsClassOf(info[2])) {
        std::string filename = info[0].As<Napi::String>();
        llvm::SMDiagnostic &err = SMDiagnostic::Extract(info[1]);
        llvm::LLVMContext &context = LLVMContext::Extract(info[2]);
        llvm::Module *module = llvm::parseIRFile(filename, err, context).release();
        if (!module) {
            // Report the diagnostic (file, line, message) like the LLVM tools do,
            // and return null instead of wrapping a null pointer.
            err.print("parseIRFile", llvm::errs());
            return env.Null();
        }
        return Module::New(env, module);
    }
    throw Napi::TypeError::New(env, ErrMsg::Function::parseIRFile);
}
