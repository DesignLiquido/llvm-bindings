if (CMAKE_HOST_APPLE)
    file(GLOB LLVM_DIRS_INTEL /usr/local/opt/llvm*)
    file(GLOB LLVM_DIRS_ARM /opt/homebrew/opt/llvm*)
    list(APPEND LLVM_DIRS ${LLVM_DIRS_INTEL} ${LLVM_DIRS_ARM})
    foreach (LLVM_DIR ${LLVM_DIRS})
        list(APPEND CMAKE_PREFIX_PATH ${LLVM_DIR}/lib/cmake/llvm)
    endforeach ()
endif ()

if (CMAKE_HOST_SYSTEM_NAME STREQUAL "Linux" AND NOT DEFINED LLVM_DIR)
    # Ubuntu apt installs LLVM cmake config at /usr/lib/llvm-X/cmake/ (not in the default
    # CMake search path). Multiple versions may be installed; find the highest one >= 18.
    foreach(llvm_major_ver 30 29 28 27 26 25 24 23 22 21 20 19 18)
        if (EXISTS "/usr/lib/llvm-${llvm_major_ver}/cmake/LLVMConfig.cmake")
            set(LLVM_DIR "/usr/lib/llvm-${llvm_major_ver}/cmake" CACHE PATH "" FORCE)
            break()
        elseif (EXISTS "/usr/lib/llvm-${llvm_major_ver}/lib/cmake/llvm/LLVMConfig.cmake")
            set(LLVM_DIR "/usr/lib/llvm-${llvm_major_ver}/lib/cmake/llvm" CACHE PATH "" FORCE)
            break()
        endif()
    endforeach()
endif ()

# Do not pass a version to find_package: Ubuntu's apt LLVM cmake config files use strict
# version matching that rejects "18" when the installed patch version is "18.1.x".
# We enforce the minimum version manually after the package is found.
find_package(LLVM REQUIRED CONFIG)

if (LLVM_PACKAGE_VERSION VERSION_LESS "22")
    message(FATAL_ERROR "LLVM 22 or later is required. Found: ${LLVM_PACKAGE_VERSION}")
endif ()

message(STATUS "Found LLVM ${LLVM_PACKAGE_VERSION}")

include_directories(${LLVM_INCLUDE_DIRS})

add_definitions(${LLVM_DEFINITIONS})

llvm_map_components_to_libnames(LLVM_LIBS core codegen irreader linker support target ${LLVM_TARGETS_TO_BUILD})
