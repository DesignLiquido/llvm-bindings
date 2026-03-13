#include "IR/CallingConv.h"
#include <llvm/IR/CallingConv.h>

namespace CallingConv {
    void Init(Napi::Env env, Napi::Object &exports) {
        Napi::Object ns = Napi::Object::New(env);

        ns.Set("C",             Napi::Number::New(env, llvm::CallingConv::C));
        ns.Set("Fast",          Napi::Number::New(env, llvm::CallingConv::Fast));
        ns.Set("Cold",          Napi::Number::New(env, llvm::CallingConv::Cold));
        ns.Set("GHC",           Napi::Number::New(env, llvm::CallingConv::GHC));
        ns.Set("HiPE",          Napi::Number::New(env, llvm::CallingConv::HiPE));
        ns.Set("AnyReg",        Napi::Number::New(env, llvm::CallingConv::AnyReg));
        ns.Set("PreserveMost",  Napi::Number::New(env, llvm::CallingConv::PreserveMost));
        ns.Set("PreserveAll",   Napi::Number::New(env, llvm::CallingConv::PreserveAll));
        ns.Set("Swift",         Napi::Number::New(env, llvm::CallingConv::Swift));
        ns.Set("CXX_FAST_TLS",  Napi::Number::New(env, llvm::CallingConv::CXX_FAST_TLS));
        ns.Set("Tail",          Napi::Number::New(env, llvm::CallingConv::Tail));
        ns.Set("CFGuard_Check", Napi::Number::New(env, llvm::CallingConv::CFGuard_Check));
        ns.Set("SwiftTail",     Napi::Number::New(env, llvm::CallingConv::SwiftTail));
        ns.Set("FirstTargetCC", Napi::Number::New(env, llvm::CallingConv::FirstTargetCC));
        ns.Set("X86_StdCall",   Napi::Number::New(env, llvm::CallingConv::X86_StdCall));
        ns.Set("X86_FastCall",  Napi::Number::New(env, llvm::CallingConv::X86_FastCall));
        ns.Set("ARM_APCS",      Napi::Number::New(env, llvm::CallingConv::ARM_APCS));
        ns.Set("ARM_AAPCS",     Napi::Number::New(env, llvm::CallingConv::ARM_AAPCS));
        ns.Set("ARM_AAPCS_VFP", Napi::Number::New(env, llvm::CallingConv::ARM_AAPCS_VFP));
        ns.Set("MSP430_INTR",   Napi::Number::New(env, llvm::CallingConv::MSP430_INTR));
        ns.Set("X86_ThisCall",  Napi::Number::New(env, llvm::CallingConv::X86_ThisCall));
        ns.Set("PTX_Kernel",    Napi::Number::New(env, llvm::CallingConv::PTX_Kernel));
        ns.Set("PTX_Device",    Napi::Number::New(env, llvm::CallingConv::PTX_Device));
        ns.Set("SPIR_FUNC",     Napi::Number::New(env, llvm::CallingConv::SPIR_FUNC));
        ns.Set("SPIR_KERNEL",   Napi::Number::New(env, llvm::CallingConv::SPIR_KERNEL));
        ns.Set("Intel_OCL_BI",  Napi::Number::New(env, llvm::CallingConv::Intel_OCL_BI));
        ns.Set("X86_64_SysV",   Napi::Number::New(env, llvm::CallingConv::X86_64_SysV));
        ns.Set("Win64",         Napi::Number::New(env, llvm::CallingConv::Win64));
        ns.Set("X86_VectorCall",Napi::Number::New(env, llvm::CallingConv::X86_VectorCall));
        ns.Set("HHVM",          Napi::Number::New(env, llvm::CallingConv::DUMMY_HHVM));
        ns.Set("HHVM_C",        Napi::Number::New(env, llvm::CallingConv::DUMMY_HHVM_C));
        ns.Set("X86_INTR",      Napi::Number::New(env, llvm::CallingConv::X86_INTR));
        ns.Set("AVR_INTR",      Napi::Number::New(env, llvm::CallingConv::AVR_INTR));
        ns.Set("AVR_SIGNAL",    Napi::Number::New(env, llvm::CallingConv::AVR_SIGNAL));
        ns.Set("AVR_BUILTIN",   Napi::Number::New(env, llvm::CallingConv::AVR_BUILTIN));
        ns.Set("AMDGPU_VS",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_VS));
        ns.Set("AMDGPU_GS",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_GS));
        ns.Set("AMDGPU_PS",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_PS));
        ns.Set("AMDGPU_CS",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_CS));
        ns.Set("AMDGPU_KERNEL", Napi::Number::New(env, llvm::CallingConv::AMDGPU_KERNEL));
        ns.Set("X86_RegCall",   Napi::Number::New(env, llvm::CallingConv::X86_RegCall));
        ns.Set("AMDGPU_HS",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_HS));
        ns.Set("MSP430_BUILTIN",Napi::Number::New(env, llvm::CallingConv::MSP430_BUILTIN));
        ns.Set("AMDGPU_LS",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_LS));
        ns.Set("AMDGPU_ES",     Napi::Number::New(env, llvm::CallingConv::AMDGPU_ES));
        ns.Set("AArch64_VectorCall", Napi::Number::New(env, llvm::CallingConv::AArch64_VectorCall));
        ns.Set("AArch64_SVE_VectorCall", Napi::Number::New(env, llvm::CallingConv::AArch64_SVE_VectorCall));
        ns.Set("WASM_EmscriptenInvoke", Napi::Number::New(env, llvm::CallingConv::WASM_EmscriptenInvoke));
        ns.Set("AMDGPU_Gfx",    Napi::Number::New(env, llvm::CallingConv::AMDGPU_Gfx));
        ns.Set("M68k_INTR",     Napi::Number::New(env, llvm::CallingConv::M68k_INTR));
        ns.Set("MaxID",         Napi::Number::New(env, llvm::CallingConv::MaxID));

        exports.Set("CallingConv", ns);
    }
}
