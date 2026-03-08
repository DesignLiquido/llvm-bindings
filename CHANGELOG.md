# [1.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v0.4.2...v1.0.0) (2026-03-08)


### Bug Fixes

* uncomment test entry ([69c93f7](https://github.com/DesignLiquido/llvm-bindings/commit/69c93f7aae697c3cb3e75d01e447554b0565e3d5))


### Features

* **Attribute:** add basic support for enum attributes ([#32](https://github.com/DesignLiquido/llvm-bindings/issues/32)) ([db45aa5](https://github.com/DesignLiquido/llvm-bindings/commit/db45aa583729956dfefa01772ab69f019e56b05a))
## [1.0.0] - 2026-03-07

### Added

- **Opaque pointer support (LLVM 15):** `PointerType.get` and `PointerType.getUnqual` now accept either a `Type` (typed pointer, existing behaviour) or an `LLVMContext` (opaque pointer, new in LLVM 15). No method renames — the overloads are resolved at runtime by inspecting the first argument.
- `PointerType.isOpaque()` — returns `true` when the pointer type carries no element type.
- `Type.isOpaquePointerTy()` — lets user code branch between typed- and opaque-pointer paths.
- `IRBuilder.getPtrTy(addrSpace?)` — returns the opaque `ptr` type; canonical replacement for `getInt8PtrTy()` in opaque-pointer IR.

### Fixed

- `isSameType` (internal helper in `src/IR/Type.cpp`) no longer aborts when either pointer is opaque; it now guards the `getPointerElementType()` call and compares opaqueness directly.

### Notes

- Typed-pointer APIs are unchanged. The LLVM 15 compatibility shim (`context->setOpaquePointers(false)`) remains active by default, so existing code continues to work without modification.

---

## [0.1.0]

Initial release.
