#ifndef LLVM_BINDINGS_NODEJS_ASSERT_H
#define LLVM_BINDINGS_NODEJS_ASSERT_H

#ifdef __cplusplus
void llvm_bindings_assert(const char* expr, const char* file, int line);

#define LLVM_BINDINGS_ASSERT_IMPL(e, file, line) ((void)llvm_bindings_assert ((e), (file), (line)))

#define assert(e) ((void) ((e) ? ((void)0) : LLVM_BINDINGS_ASSERT_IMPL (#e, __FILE__, __LINE__)))

#endif

#endif
