import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://store.bulkbasketindia.com/api/mobile";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Add token automatically to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------- PROFILE API ----------------
export const getProfileApi = async () => {
  try {
    const response = await api.get("/get-profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ---------------- COMPANY PROFILE API ----------------
export const getCompanyProfileApi = async () => {
  try {
    const response = await api.get("/get-company");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ---------------- UPDATE COMPANY PROFILE API ----------------
export const updateCompanyProfileApi = async (data) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.legal_name) formData.append("legal_name", data.legal_name);
    if (data.gst) formData.append("gst", data.gst);
    if (data.fssai) formData.append("fssai", data.fssai);
    if (data.address) formData.append("address", data.address);

    const response = await api.post("/update-profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ---------------- UPDATE PROFILE API ----------------
export const updateProfileApi = async (data) => {
  try {
    const response = await api.post("/update-profile", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ---------------- GET PRODUCTS API ---------------- //
export const getProductsApi = async (
  catId,
  subcat_id = null,
  subsubcats = [],
) => {
  try {
    let url = `/get-products/${catId}`;

    if (subcat_id) {
      url += `/${subcat_id}`;

      if (subsubcats.length > 0) {
        url += `/${subsubcats.join(",")}`;
      }
    }

    const response = await api.get(url);
    console.log("Get Products API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Get Products API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export const getProductsByBrandApi = async (
  brand_id,
  category_id = null,
  sub_category_id = null,
  ss_category_id = null,
) => {
  try {
    let url = `/get-product-by-brand/${brand_id}`;

    if (category_id) {
      url += `/${category_id}`;
      if (sub_category_id) {
        url += `/${sub_category_id}`;
        if (ss_category_id) {
          url += `/${ss_category_id}`;
        }
      }
    }

    const response = await api.get(url);
    console.log("Get Products By Brand API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Get Products By Brand API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export const getCategoriesApi = async () => {
  try {
    const response = await api.get("/get-category");

    console.log("Get Categories API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Get Categories API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export const addToCartApi = async (product_id, qty) => {
  try {
    const response = await api.post("/add-to-cart", {
      product_id: product_id,
      qty: qty,
    });

    console.log("Add To Cart API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Add To Cart API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET CART API ----------------

export const getCartApi = async () => {
  try {
    const response = await api.get("/get-cart");

    console.log("Get Cart API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log("Get Cart API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ---------------- REMOVE CART ITEM API ----------------

export const removeCartItemApi = async (cart_id) => {
  try {
    const response = await api.post(`/remove-cart-item`, {
      cart_id: cart_id,
    });

    return response.data;
  } catch (error) {
    console.log(
      "Remove Cart Item API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export const updateCartQuantityApi = async (product_id, quantity) => {
  try {
    const response = await api.post("/update-cart-qty", {
      product_id: product_id,
      qty: Number(quantity),
    });

    console.log("Update Cart Quantity API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Update Cart Quantity API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- ADD TO WISHLIST ----------------

export const addToWishlistApi = async (product_id) => {
  try {
    const response = await api.post("/add-to-wishlist", {
      product_id: product_id,
    });

    console.log("Add To Wishlist API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Add To Wishlist API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- UPDATE WISHLIST QTY ----------------

export const updateWishlistQtyApi = async (product_id, qty) => {
  try {
    const response = await api.post("/update-wishlist-qty", {
      product_id: product_id,
      qty: qty,
    });

    console.log("Update Wishlist Qty API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Update Wishlist Qty API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET WISHLIST ----------------

export const getWishlistApi = async () => {
  try {
    const response = await api.get("/get-wishlist");

    console.log("Get Wishlist API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Wishlist API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- SAVE ADDRESS API ----------------

export const saveAddressApi = async (data) => {
  try {
    const formData = new FormData();

    formData.append("address_line_1", data.address_line_1);
    formData.append("address_line_2", data.address_line_2);
    formData.append("address", data.address);
    formData.append("state", data.state);
    formData.append("district", data.district);
    formData.append("city", data.city);
    formData.append("pincode", data.pincode);
    formData.append("coordinates", data.coordinates);
    formData.append("id", data.id);

    const response = await api.post("/save-address", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Save Address API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Save Address API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET ADDRESS API ----------------

export const getAddressApi = async () => {
  try {
    const response = await api.get("/get-address");

    console.log("Get Address API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Get Address API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- DELETE ADDRESS API ----------------

export const deleteAddressApi = async (id) => {
  try {
    const response = await api.post("/delete-address", {
      id: id,
    });

    console.log("Delete Address API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Delete Address API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- UPDATE DEFAULT ADDRESS API ----------------

export const updateDefaultAddressApi = async (address_id) => {
  try {
    const response = await api.post("/update-default-address", {
      address_id: address_id,
    });

    // console.log("Update Default Address API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Update Default Address API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET STATES API ----------------

export const getStatesApi = async () => {
  try {
    const response = await api.get("/get-states");
    console.log("Get States API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Get States API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ---------------- GET DISTRICTS API ----------------

export const getDistrictsApi = async (state) => {
  try {
    const response = await api.get(`/get-district/${state}`);
    console.log("Get Districts API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Districts API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET PRODUCT DETAILS API ----------------

export const getProductDetailsApi = async (product_id) => {
  try {
    const response = await api.get(`/get-product-details/${product_id}`);

    console.log("Get Product Details API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "Get Product Details API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET BRANDS API ----------------

export const getBrandsApi = async () => {
  try {
    const response = await api.get("/get-brands");
    console.log("Get Brands API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Get Brands API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ---------------- SAVE ORDER API ----------------

export const saveOrderApi = async (data) => {
  try {
    const formData = new FormData();
    formData.append("delivery_date", data.delivery_date);
    formData.append("address", data.address);
    formData.append("state", data.state);
    formData.append("district", data.district);
    formData.append("city", data.city);
    formData.append("pincode", data.pincode);
    formData.append("pay_mode", data.pay_mode);
    formData.append("remarks", data.remarks || "");
    const response = await api.post("/save-order", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Save Order API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Save Order API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ---------------- GET WALLET LEDGER API ----------------
export const getWalletLedgerApi = async () => {
  try {
    const response = await api.get("/get-wallet-ledger");
    console.log("Get Wallet Ledger API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Wallet Ledger API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET ORDER API ----------------
export const getOrderApi = async () => {
  try {
    const response = await api.get("/get-order");
    console.log("Get Order API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Get Order API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const getEstimateApi = async () => {
  try {
    const response = await api.get("/get-estimate");
    console.log("Get Estimate API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Estimate API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export const getEstimateDetailsApi = async (estimate_id) => {
  try {
    const response = await api.get(`/get-estimate-details/${estimate_id}`);
    console.log("Get Estimate Details API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Estimate Details API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- SEARCH PRODUCTS API ----------------

export const searchProductsApi = async (query) => {
  try {
    const response = await api.get(`/search-products/${query}`);
    console.log("Search Products API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Search Products API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET ORDER DETAILS API ----------------

export const getOrderDetailsApi = async (order_id) => {
  try {
    const response = await api.get(`/get-order-details/${order_id}`);
    console.log("Get Order Details API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Order Details API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ---------------- GET DEAL PRODUCTS API ----------------
export const getDealProductsApi = async () => {
  try {
    const response = await api.get("/get-products-deal");
    console.log("Get Deal Products API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Get Deal Products API Error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export default api;
