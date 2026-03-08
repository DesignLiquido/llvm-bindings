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
brew install cmake llvm@15

# install llvm-bindings by yarn
yarn add llvm-bindings
```

### Install on Ubuntu

```shell
#install llvm by installation script
wget https://apt.llvm.org/llvm.sh
sudo chmod +x llvm.sh
sudo ./llvm.sh 15

# install cmake and zlib by apt-get
sudo apt-get install cmake zlib1g-dev

# install llvm-bindings by yarn
yarn add llvm-bindings
```

### Install on Windows

First, please refer to [Build LLVM from sources on Windows 10](https://github.com/ApsarasX/llvm-bindings/wiki/Build-LLVM-from-source-code-on-Windows-10) to build LLVM. An alternative is to download [prebuilt LLVM binary](https://github.com/ApsarasX/llvm-windows/releases).

Then, find the `llvm-config` command in your LLVM build directory and execute `llvm-config --cmakedir` to get LLVM cmake directory, assuming `C:\Users\dev\llvm-15.0.7.src\build\lib\cmake\llvm`.

Finally, execute the following commands.

```shell
# specify the LLVM cmake directory for cmake-js
# note: cmake-js reads npm-style config keys
npm config set cmake_LLVM_DIR C:\Users\dev\llvm-15.0.7.src\build\lib\cmake\llvm

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

## Compatibility

| llvm-bindings versions                     | compatible LLVM versions |
|--------------------------------------------|--------------------------|
| (original llvm-bindings repo) 0.0.x, 0.1.x | 11.0.x, 11.1.x           |
| (original llvm-bindings repo) 0.2.x        | 12.0.x                   |
| (original llvm-bindings repo) 0.3.x        | 13.0.x                   |
| (original llvm-bindings repo) 0.4.x        | 14.0.x                   |
| (@designliquido/llvm-bindings) 0.1.x       | 14.0.x                   |
| (@designliquido/llvm-bindings) 1.0.x       | 15.0.x                   |

## Acknowledgments

- [MichaReiser](https://github.com/MichaReiser): the creator of [llvm-node](https://github.com/MichaReiser/llvm-node)
- [ApsarasX's original `llvm-bindings` project](https://github.com/ApsarasX/llvm-bindings)

