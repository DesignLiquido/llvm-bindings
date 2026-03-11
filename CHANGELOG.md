# Changelog

## [9.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v8.0.0...v9.0.0) (2026-03-11)

### At a glance

- LLVM 22 compatibility release.
- No breaking JavaScript/TypeScript API surface changes.
- Internal binding update for debug-info language representation.
- Minimum supported LLVM version raised to 22.

### Changed

- `DIBuilder.createCompileUnit` now calls `llvm::DISourceLanguageName(lang)` instead of a raw `dwarf::SourceLanguage` cast, matching the LLVM 22 API. The JavaScript/TypeScript signature is unchanged (still accepts a number).
- Removed the `#if LLVM_VERSION_MAJOR >= 22` / `#else` conditional in `DIBuilder.cpp`; only the LLVM 22+ code path is retained.
- `cmake/LLVM.cmake` version-discovery loop and minimum-version guard updated to require LLVM >= 22.

## [8.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v7.0.0...v8.0.0) (2026-03-11)

### At a glance

- LLVM 21 upgrade with JavaScript/TypeScript-visible API updates.
- Removes stale `Attribute.AttrKind.NoCapture` from declarations.
- Adds `ICmpInst` `samesign` support and AtomicRMW construction/introspection APIs.

### Changed

- Removed `Attribute.AttrKind.NoCapture` from `llvm-bindings.d.ts` to match LLVM 21 runtime behavior.

### Added

- `ICmpInst.getSameSign(): boolean`
- `ICmpInst.setSameSign(value: boolean): void`
- `AtomicRMWInst.BinOp` static enum-like object with all operations, including LLVM 21 additions `FMaximum` and `FMinimum`.
- `AtomicRMWInst.getOperation(): number`
- `IRBuilder.CreateAtomicRMW(op, ptr, val, align, ordering): AtomicRMWInst`

### Migration notes

- Replace usages of `Attribute.AttrKind.NoCapture` with LLVM 21-compatible attribute construction.

## [7.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v6.0.0...v7.0.0) (2026-03-10)

### At a glance

- LLVM 20 compatibility release.
- No JavaScript/TypeScript API surface changes.

## [6.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v5.0.0...v6.0.0) (2026-03-09)

### At a glance

- LLVM 19 compatibility update.
- Internal binding updates for debug-info representation and `CreateNeg` signature adaptation.
- No breaking JavaScript/TypeScript API changes.

## [5.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v4.0.0...v5.0.0) (2026-03-09)

### At a glance

- LLVM 18 migration release.
- Typed pointers removed upstream; opaque-pointer-only model enforced.
- Compatibility shims retained for common pointer helper usage.

## [4.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v2.0.0...v4.0.0) (2026-03-09)

### At a glance

- LLVM 17 compatibility release.
- Opaque pointers mandatory in LLVM; binding API remains stable for consumers.

## [2.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v1.0.0...v2.0.0) (2026-03-08)

### At a glance

- LLVM 16 compatibility release.
- No JavaScript/TypeScript API surface changes.

## [1.0.0](https://github.com/DesignLiquido/llvm-bindings/compare/v0.4.2...v1.0.0) (2026-03-08)

### At a glance

- First major release in this line with LLVM 15 opaque-pointer support.

### Added

- **Opaque pointer support (LLVM 15):** `PointerType.get` and `PointerType.getUnqual` accept either a `Type` (typed pointer) or an `LLVMContext` (opaque pointer).
- `PointerType.isOpaque()`
- `Type.isOpaquePointerTy()`
- `IRBuilder.getPtrTy(addrSpace?)`

### Fixed

- `isSameType` (internal helper in `src/IR/Type.cpp`) no longer aborts when either pointer is opaque.

### Notes

- Typed-pointer APIs remain available in compatibility mode (`context->setOpaquePointers(false)` in this release line).

## [0.1.0]

Initial release.
