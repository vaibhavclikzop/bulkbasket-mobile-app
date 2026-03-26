if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/a1989/Desktop/Bulk bASEKET/BackUp/BulkBasket/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/z601d1b1/obj/x86_64/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/a1989/Desktop/Bulk bASEKET/BackUp/BulkBasket/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

