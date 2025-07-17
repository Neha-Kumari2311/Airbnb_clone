const axios = require("axios");
require("dotenv").config();

async function geocodePlace(location) {
  const MAP_TOKEN = process.env.MAP_TOKEN;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
    location
  )}.json?key=${MAP_TOKEN}`;
  console.log("🛰️ Calling geocode API with URL:", url);

  try {
    const response = await axios.get(url, { timeout: 10000 }); // ⏱️ Increased to 10 sec

    const features = response.data.features;

    if (features && features.length > 0) {
      const [lng, lat] = features[0].geometry.coordinates;
      console.log("✅ Coordinates found:", { lat, lng });
      return { lat, lng };
    } else {
      console.warn("📍 No geocoding results for:", location);
      return null;
    }
  } catch (error) {
    console.error(
      "❌ Axios Geocoding Error:",
      error.code || error.message,
      error?.response?.status || ""
    );
    return null;
  }
}

module.exports = { geocodePlace };
