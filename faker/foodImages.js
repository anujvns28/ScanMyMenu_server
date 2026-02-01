// utils/foodImages.js

const foodImages = {
  starters: [
    "/public/food/starter1.jpg",
    "/public/food/starter2.jpg",
    "/public/food/starter3.jpg",
    "/public/food/starter4.jpg",
    "/public/food/starter5.jpg",
    "/public/food/starter6.jpg",
    "/public/food/starter7.jpg",
    "/public/food/starter8.jpg",
    "/public/food/starter9.jpg",
    "/public/food/starter10.jpg",
  ],

  maincourse: [
    "/public/food/mainCourse1.jpg",
    "/public/food/mainCourse2.jpg",
    "/public/food/mainCourse3.jpg",
    "/public/food/mainCourse4.jpg",
    "/public/food/mainCourse5.jpg",
    "/public/food/mainCourse6.jpg",
    "/public/food/mainCourse7.jpg",
    "/public/food/mainCourse8.jpg",
    "/public/food/mainCourse9.jpg",
    "/public/food/mainCourse10.jpg",
  ],

  rice: [
    "/public/food/rice1.jpg",
    "/public/food/rice2.jpg",
    "/public/food/rice3.jpg",
    "/public/food/rice4.jpg",
    "/public/food/rice5.jpg",
    "/public/food/rice6.jpg",
    "/public/food/rice7.jpg",
    "/public/food/rice8.jpg",
    "/public/food/rice9.jpg",
    "/public/food/rice10.jpg",
  ],

  biryani: [
    "/public/food/biryani1.jpg",
    "/public/food/biryani2.jpg",
    "/public/food/biryani3.jpg",
    "/public/food/biryani4.jpg",
    "/public/food/biryani5.jpg",
    "/public/food/biryani6.jpg",
    "/public/food/biryani7.jpg",
    "/public/food/biryani8.jpg",
    "/public/food/biryani9.jpg",
    "/public/food/biryani10.jpg",
  ],

  breads: [
    "/public/food/bread1.jpg",
    "/public/food/bread2.jpg",
    "/public/food/bread3.jpg",
    "/public/food/bread4.jpg",
    "/public/food/bread5.jpg",
    "/public/food/bread6.jpg",
  ],

  desserts: [
    "/public/food/dessert1.jpg",
    "/public/food/dessert2.jpg",
    "/public/food/dessert3.jpg",
    "/public/food/dessert4.jpg",
    "/public/food/dessert5.jpg",
    "/public/food/dessert6.jpg",
    "/public/food/dessert7.jpg",
    "/public/food/dessert8.jpg",
  ],

  beverages: [
    "/public/food/Beverages1.jpg",
    "/public/food/Beverages2.jpg",
    "/public/food/Beverages3.jpg",
    "/public/food/Beverages4.jpg",
    "/public/food/Beverages5.jpg",
    "/public/food/Beverages6.jpg",
    "/public/food/Beverages7.jpg",
    "/public/food/Beverages8.jpg",
    "/public/food/Beverages9.jpg",
    "/public/food/Beverages10.jpg",
  ],

  noodles: [
    "/public/food/Noodles1.jpg",
    "/public/food/Noodles2.jpg",
    "/public/food/Noodles3.jpg",
    "/public/food/Noodles4.jpg",
    "/public/food/Noodles5.jpg",
    "/public/food/Noodles6.jpg",
    "/public/food/Noodles7.jpg",
    "/public/food/Noodles8.jpg",
    "/public/food/Noodles9.jpg",
    "/public/food/Noodles10.jpg",
  ],

  momos: [
    "/public/food/Momos1.jpg",
    "/public/food/Momos2.jpg",
    "/public/food/Momos3.jpg",
    "/public/food/Momos4.jpg",
    "/public/food/Momos5.jpg",
    "/public/food/Momos6.jpg",
    "/public/food/Momos7.jpg",
    "/public/food/Momos8.jpg",
    "/public/food/Momos9.jpg",
     "/public/food/Momos10.jpg",
  ],

  // 🔥 Burger + Sandwich COMBINED
  burgersandsandwiches: [
    "/public/food/burger.jpg",
    "/public/food/burger2.jpg",
    "/public/food/burger3.jpg",
    "/public/food/burger4.jpg",
    "/public/food/sandwich1.jpg",
    "/public/food/sandwich2.jpg",
    "/public/food/sandwich3.jpg",
    "/public/food/sandwich4.jpg",
  ],

  soups: [
    "/public/food/soups1.jpg",
    "/public/food/soups2.jpg",
    "/public/food/soups3.jpg",
    "/public/food/soups4.jpg",
    "/public/food/soups5.jpg",
    "/public/food/soups6.jpg",
    "/public/food/soups7.jpg",
    "/public/food/soups8.jpg",
    "/public/food/soups9.jpg",
  ],
};

/* ---------------- NORMALIZER ---------------- */

const normalizeCategoryKey = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");
};

/* ---------------- STRICT PICKER ---------------- */

const getRandomImageByCategory = (categoryName) => {
  const key = normalizeCategoryKey(categoryName);
  const images = foodImages[key];

  if (!images || images.length === 0) {
    console.warn(`⚠️ No images mapped for category: ${categoryName}`);
    return null;
  }

  return images[Math.floor(Math.random() * images.length)];
};

module.exports = {
  foodImages,
  getRandomImageByCategory,
};
