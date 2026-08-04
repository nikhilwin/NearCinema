import { getDistance } from '../controllers/cinemas.js';

const runTests = () => {
  console.log("Running backend distance calculations test...");

  // Coordinates of PVR Sigra, Varanasi
  const pvrSigra = { lat: 25.3176, lon: 82.9739 };
  // Coordinates of INOX JHV, Varanasi
  const inoxJhv = { lat: 25.3356, lon: 82.9745 };
  
  // Real world coordinates of some users
  const user1 = { lat: 25.320, lon: 82.975 }; // close to both

  console.log(`PVR Sigra: (${pvrSigra.lat}, ${pvrSigra.lon})`);
  console.log(`INOX JHV: (${inoxJhv.lat}, ${inoxJhv.lon})`);
  console.log(`User coordinates: (${user1.lat}, ${user1.lon})`);

  const distToSigra = getDistance(user1.lat, user1.lon, pvrSigra.lat, pvrSigra.lon);
  const distToJhv = getDistance(user1.lat, user1.lon, inoxJhv.lat, inoxJhv.lon);

  console.log(`Calculated distance to PVR Sigra: ${distToSigra.toFixed(2)} km`);
  console.log(`Calculated distance to INOX JHV: ${distToJhv.toFixed(2)} km`);

  // Assert reasonable ranges
  if (distToSigra > 0 && distToSigra < 1) {
    console.log("ASSERT SUCCESS: User 1 is within 1 km of PVR Sigra.");
  } else {
    console.error("ASSERT FAIL: Distance value out of expected bounds.");
    process.exit(1);
  }

  if (distToJhv > 1 && distToJhv < 3) {
    console.log("ASSERT SUCCESS: User 1 is between 1 km and 3 km of INOX JHV.");
  } else {
    console.error("ASSERT FAIL: Distance value out of expected bounds.");
    process.exit(1);
  }

  console.log("\nALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!");
};

runTests();
