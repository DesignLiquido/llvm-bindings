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
