const axios = require("axios");

const BASE_URL = "https://store.bulkbasketindia.com/api/mobile";

async function test() {
  console.log("coming from text_api.js");

  try {
    console.log("coming from text_api.js inside try");

    console.log("Fetching Categories...");
    const catRes = await axios.get(`${BASE_URL}/get-category`);
    const cats = catRes.data.data;
    if (!cats || cats.length === 0) {
      console.log("No categories found");
      return;
    }

    const sampleCat = cats[0];
    const catId = sampleCat.id;
    console.log(`\nTesting Category: ${sampleCat.name} (ID: ${catId})`);

    const prodRes = await axios.get(`${BASE_URL}/get-products/${catId}`);
    const data = prodRes.data.data;

    let sampleSubCatId = null;
    let sampleSubSubCatId = null;

    for (const cat of data) {
      if (cat.subSubCategory && cat.subSubCategory.length > 0) {
        sampleSubCatId = cat.sub_category_id;
        sampleSubSubCatId = cat.subSubCategory[0].id;
        break;
      }
    }

    if (!sampleSubCatId || !sampleSubSubCatId) {
      console.log(
        "Could not find a valid subcategory with sub-subcategories to test",
      );
      return;
    }

    console.log(
      `Found valid testing IDs: SubCat=${sampleSubCatId}, SubSubCat=${sampleSubSubCatId}`,
    );

    const formats = [
      `${BASE_URL}/get-products/${catId}/all/${sampleSubSubCatId}`,
      `${BASE_URL}/get-products/${catId}/0/${sampleSubSubCatId}`,
      `${BASE_URL}/get-products/${catId}/${sampleSubCatId}/${sampleSubSubCatId}`,
    ];

    for (const url of formats) {
      try {
        console.log(`\nRequesting: ${url}`);
        const res = await axios.get(url);
        console.log(`Status: ${res.status}`);
        console.log(`Success: ${res.data.status}`);
        if (res.data.data && res.data.data.length > 0) {
          const prods = res.data.data[0].products || [];
          console.log(`Products Count in first subcat: ${prods.length}`);
          if (prods.length > 0) {
            console.log(`Sample Product: ${prods[0].name}`);
          }
        } else {
          console.log("Empty response data");
        }
      } catch (err) {
        console.log(`Failed: ${err.message}`);
      }
    }
  } catch (error) {
    console.error("Test Error:", error.message);
  }
}

test();
