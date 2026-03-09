# llvm-bindings

LLVM bindings for Node.js/JavaScript/TypeScript. This project is a hard fork of https://github.com/ApsarasX/llvm-bindings, which it does not seem to be maintained anymore.

[![github-action](https://img.shields.io/github/actions/workflow/status/DesignLiquido/llvm-bindings/build.yml?style=flat-square)](https://github.com/DesignLiquido/llvm-bindings/actions)
[![npm](https://img.shields.io/npm/v/@designliquido/llvm-bindings?style=flat-square)](https://www.npmjs.com/package/@designliquido/llvm-bindings)
[![github-license](https://img.shields.io/github/license/DesignLiquido/llvm-bindings?style=flat-square)](https://github.com/DesignLiquido/llvm-bindings/blob/master/LICENSE)

## Supported OS

|                    | x86_64 | ARM64 |
|:------------------:|:------:|:-----:|
| macOS 15 Sequoia   |   ✅   |   ✅  |
|     macOS 26       |   /    |   ✅  |
|   Ubuntu 22.04     |   ✅   |   /   |
|   Ubuntu 24.04     |   ✅   |   /   |
| Windows Server 2022|   ✅   |  ⚠️  |

> ⚠️ means not tested.

## Supported LLVM methods

listed in the [TypeScript definition file](./llvm-bindings.d.ts).

## Install

### Install on macOS

```shell
# install cmake and llvm by homebrew
brew install cmake llvm@19

# install llvm-bindings by yarn
yarn add llvm-bindings
```

### Install on Ubuntu

```shell
#install llvm by installation script
wget https://apt.llvm.org/llvm.sh
sudo chmod +x llvm.sh
sudo ./llvm.sh 19

# install cmake and zlib by apt-get
sudo apt-get install cmake zlib1g-dev

# install llvm-bindings by yarn
yarn add llvm-bindings
```

### Install on Windows

First, please refer to [Build LLVM from sources on Windows 10](https://github.com/ApsarasX/llvm-bindings/wiki/Build-LLVM-from-source-code-on-Windows-10) to build LLVM. An alternative is to download the [prebuilt LLVM 19 binary for Windows](https://github.com/DesignLiquido/llvm-windows/releases/tag/llvmorg-19.1.7).

Then, find the `llvm-config` command in your LLVM build directory and execute `llvm-config --cmakedir` to get LLVM cmake directory, assuming `C:\Users\dev\LLVM-19.1.7-win64\lib\cmake\llvm`.

Finally, execute the following commands.

```shell
# specify the LLVM cmake directory for cmake-js
# note: cmake-js reads npm-style config keys
npm config set cmake_LLVM_DIR C:\Users\dev\LLVM-19.1.7-win64\lib\cmake\llvm

# install llvm-bindings by yarn
yarn add llvm-bindings
```

> Note: The build type of `llvm-bindings` must be consistent with LLVM, otherwise there will be many compilation errors when building `llvm-bindings`.

### Custom LLVM Installation
You can use the configuration options read by `cmake-js` to set the path to the LLVM cmake directory. This is needed if you don't want to use the system default LLVM installation.

```shell
# specify the llvm cmake directory by npm-compatible config and cmake-js
npm config set cmake_LLVM_DIR $(path-to-llvm/bin/llvm-config --cmakedir)

# install llvm-bindings by yarn
yarn add llvm-bindings
```

## Usage

```javascript
import llvm from 'llvm-bindings';

function main(): void {
    const context = new llvm.LLVMContext();
    const module = new llvm.Module('demo', context);
    const builder = new llvm.IRBuilder(context);

    const returnType = builder.getInt32Ty();
    const paramTypes = [builder.getInt32Ty(), builder.getInt32Ty()];
    const functionType = llvm.FunctionType.get(returnType, paramTypes, false);
    const func = llvm.Function.Create(functionType, llvm.Function.LinkageTypes.ExternalLinkage, 'add', module);

    const entryBB = llvm.BasicBlock.Create(context, 'entry', func);
    builder.SetInsertPoint(entryBB);
    const a = func.getArg(0);
    const b = func.getArg(1);
    const result = builder.CreateAdd(a, b);
    builder.CreateRet(result);

    if (llvm.verifyFunction(func)) {
        console.error('Verifying function failed');
        return;
    }
    if (llvm.verifyModule(module)) {
        console.error('Verifying module failed');
        return;
    }
    console.log(module.print());
}

main();
```

> You cannot declare a variable or constant named `module` in top level, because `module` is a built-in object in Node.js.

## Note
Due to the limitation of `node-addon-api`, this project has not implemented inheritance yet, so calling the method of superclass from subclass object will report an error. Please see [#1](https://github.com/ApsarasX/llvm-bindings/issues/1) for details.

## Opaque Pointers (LLVM 15 / v1.0.0)

LLVM 15 makes opaque pointers the default. Starting from v1.0.0 this library exposes the necessary APIs to opt into opaque-pointer IR while keeping all existing typed-pointer APIs intact.

**New APIs**

| API | Description |
|-----|-------------|
| `PointerType.get(context, addrSpace)` | Creates an opaque pointer type (pass `LLVMContext` instead of `Type`) |
| `PointerType.getUnqual(context)` | Shorthand for address space 0 opaque pointer |
| `PointerType.isOpaque()` | Returns `true` if the pointer type carries no element type |
| `Type.isOpaquePointerTy()` | Returns `true` if the type is an opaque pointer |
| `IRBuilder.getPtrTy(addrSpace?)` | Returns the opaque `ptr` type; replaces `getInt8PtrTy()` in opaque-pointer IR |

**Compatibility shim**

Typed-pointer code continues to work without changes. The compatibility flag `context->setOpaquePointers(false)` is set automatically in `LLVMContext`'s constructor, so existing code is unaffected.

To opt into opaque pointers, pass an `LLVMContext` to `PointerType.get` / `getUnqual` and use `getPtrTy()` for generic pointer values.

## LLVM 16 / v2.0.x

LLVM 16 keeps opaque pointers as the default and retains full typed-pointer support behind the `setOpaquePointers(false)` flag. No API changes were introduced in this library between v1.0.x and v2.0.x beyond the underlying LLVM version bump.

## LLVM 17 / v4.0.x

LLVM 17 removes the `setOpaquePointers` flag and makes opaque pointers mandatory, while still retaining deprecated typed-pointer factory functions. No breaking API changes were made to this library for v4.0.x; the same opaque-pointer APIs introduced in v1.0.0 continued to work.

## LLVM 18 / v5.0.x — Typed Pointers Removed

LLVM 18 **completely removes** typed pointers. All pointer types are now opaque (`ptr`). The following APIs were removed from LLVM and are no longer available:

**Removed APIs**

| Removed API | Replacement |
|-------------|-------------|
| `Type.getInt8PtrTy(context)` *(LLVM C++ API)* | `PointerType.get(context, 0)` — this library still exposes `Type.getInt8PtrTy` as a convenience shim |
| `Type.getInt32PtrTy(context)` and other typed ptr factories | Same: all `get*PtrTy` helpers now return an opaque `ptr` |
| `Type.isOpaquePointerTy()` | Always returns `true`; use `isPointerTy()` instead |
| `Type.getNonOpaquePointerElementType()` | Removed — opaque pointers have no element type; throws at runtime |
| `Type.getPointerTo(addrSpace?)` *(LLVM C++ API)* | `PointerType.get(context, addrSpace)` — this library still exposes `Type.getPointerTo` as a convenience shim |
| `PointerType.get(elementType, addrSpace)` *(typed overload)* | `PointerType.get(context, addrSpace)` |
| `PointerType.getUnqual(elementType)` *(typed overload)* | `PointerType.getUnqual(context)` |
| `PointerType.getNonOpaquePointerElementType()` | Removed — throws at runtime |
| `PointerType.isOpaque()` | Always returns `true` |
| `IRBuilder.getInt8PtrTy(addrSpace?)` *(LLVM C++ API)* | `IRBuilder.getPtrTy(addrSpace?)` — this library still exposes `getInt8PtrTy` as a shim |

**Migration guide**

- Replace any `PointerType.get(someType, addrSpace)` calls with `PointerType.get(context, addrSpace)`.
- Replace any `PointerType.getUnqual(someType)` calls with `PointerType.getUnqual(context)`.
- Use `isPointerTy()` instead of `isOpaquePointerTy()`.
- Do not call `getNonOpaquePointerElementType()` — it will throw.
- The convenience helpers `Type.getInt8PtrTy(context)`, `Type.getInt32PtrTy(context)`, etc. and `IRBuilder.getInt8PtrTy()` are kept as shims that internally call `PointerType.get(context, 0)`.

## LLVM 19 / v6.0.x

LLVM 19 introduces two internal changes that required C++ binding updates, but the JavaScript/TypeScript API surface is unchanged:

- **RemoveDIs (new debug-info format)**: LLVM 19 defaults to a non-intrinsic debug-info representation where `DIBuilder.insertDeclare` and `DIBuilder.insertDbgValueIntrinsic` return a `DbgRecord*` instead of an `Instruction*`. This library forces the classic intrinsic-based format on the module when a `DIBuilder` is constructed, so both methods continue to return an `Instruction` as documented.
- **`CreateNeg` signature change**: `IRBuilder.CreateNeg` dropped its `HasNUW` parameter (negation cannot overflow in the unsigned direction); it now accepts only `(value, name?, hasNSW?)`. The binding is updated accordingly; the JavaScript API is unchanged.


## Compatibility

| llvm-bindings versions                     | compatible LLVM versions |
|--------------------------------------------|--------------------------|
| (original llvm-bindings repo) 0.0.x, 0.1.x | 11.0.x, 11.1.x           |
| (original llvm-bindings repo) 0.2.x        | 12.0.x                   |
| (original llvm-bindings repo) 0.3.x        | 13.0.x                   |
| (original llvm-bindings repo) 0.4.x        | 14.0.x                   |
| (@designliquido/llvm-bindings) 0.1.x       | 14.0.x                   |
| (@designliquido/llvm-bindings) 1.0.x       | 15.0.x                   |
| (@designliquido/llvm-bindings) 2.0.x       | 16.0.x                   |
| (@designliquido/llvm-bindings) 4.0.x       | 17.0.x                   |
| (@designliquido/llvm-bindings) 5.0.x       | 18.1.x                   |
| (@designliquido/llvm-bindings) 6.0.x       | 19.1.x                   |

## Acknowledgments

- [MichaReiser](https://github.com/MichaReiser): the creator of [llvm-node](https://github.com/MichaReiser/llvm-node)
- [ApsarasX's original `llvm-bindings` project](https://github.com/ApsarasX/llvm-bindings)

