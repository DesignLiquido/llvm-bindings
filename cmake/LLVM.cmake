if (CMAKE_HOST_APPLE)
    file(GLOB LLVM_DIRS_INTEL /usr/local/opt/llvm*)
    file(GLOB LLVM_DIRS_ARM /opt/homebrew/opt/llvm*)
    list(APPEND LLVM_DIRS ${LLVM_DIRS_INTEL} ${LLVM_DIRS_ARM})
    foreach (LLVM_DIR ${LLVM_DIRS})
        list(APPEND CMAKE_PREFIX_PATH ${LLVM_DIR}/lib/cmake/llvm)
    endforeach ()
endif ()

if (CMAKE_HOST_SYSTEM_NAME STREQUAL "Linux")
    # Ubuntu apt-installed LLVM packages place cmake files under /usr/lib/llvm-X/cmake/
    # Enumerate installed versions so CMake can find them regardless of version compat quirks
    file(GLOB LLVM_DIRS_LINUX /usr/lib/llvm-*)
    foreach (LLVM_DIR ${LLVM_DIRS_LINUX})
        list(APPEND CMAKE_PREFIX_PATH ${LLVM_DIR}/cmake)
        list(APPEND CMAKE_PREFIX_PATH ${LLVM_DIR}/lib/cmake/llvm)
    endforeach ()
endif ()

# Do not pass a version to find_package: Ubuntu's apt LLVM cmake config files use strict
# version matching that rejects "18" when the installed patch version is "18.1.x".
# We enforce the minimum version manually after the package is found.
find_package(LLVM REQUIRED CONFIG)

if (LLVM_PACKAGE_VERSION VERSION_LESS "18")
    message(FATAL_ERROR "LLVM 18 or later is required. Found: ${LLVM_PACKAGE_VERSION}")
endif ()

message(STATUS "Found LLVM ${LLVM_PACKAGE_VERSION}")

include_directories(${LLVM_INCLUDE_DIRS})

add_definitions(${LLVM_DEFINITIONS})

llvm_map_components_to_libnames(LLVM_LIBS core codegen irreader linker support target ${LLVM_TARGETS_TO_BUILD})
