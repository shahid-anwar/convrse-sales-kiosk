require("dotenv").config();
const { connectDB } = require("../config/db");
const mongoose = require("mongoose");
const Unit = require("../models/Unit");
const GalleryItem = require("../models/GalleryItem");
const Video = require("../models/Video");

const galleryItems = [
  {
    title: "Clubhouse Exterior",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    thumbnailUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400",
    order: 1,
  },
  {
    title: "Living Room - Sample Flat",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    order: 2,
  },
  {
    title: "Modular Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200",
    thumbnailUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400",
    order: 3,
  },
  {
    title: "Swimming Pool Deck",
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200",
    thumbnailUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400",
    order: 4,
  },
  {
    title: "Landscaped Gardens",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    thumbnailUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    order: 5,
  },
  {
    title: "Tower Facade - Night View",
    imageUrl: "https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=1200",
    thumbnailUrl: "https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=400",
    order: 6,
  },
];

const videos = [
  {
    title: "Project Walkthrough - Master Plan",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    durationSeconds: 42,
    order: 1,
  },
  {
    title: "Amenities Tour",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400",
    durationSeconds: 30,
    order: 2,
  },
  {
    title: "Sample Flat Tour - 2BHK",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    thumbnailUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400",
    durationSeconds: 55,
    order: 3,
  },
];

function buildUnits() {
  const towers = ["Tower A", "Tower B"];
  const units = [];
  for (const tower of towers) {
    for (let floor = 1; floor <= 5; floor++) {
      for (let n = 1; n <= 4; n++) {
        const unitNumber = `${floor}0${n}`;
        units.push({
          tower,
          unitNumber,
          floor,
          type: n % 2 === 0 ? "3BHK" : "2BHK",
          price: n % 2 === 0 ? 9800000 : 7600000,
          status: "available",
        });
      }
    }
  }
  // Pre-book a handful so the board isn't all-green on first load.
  const preBook = [0, 5, 12, 23];
  preBook.forEach((i) => {
    units[i].status = "booked";
    units[i].bookedBy = { customerName: "Demo Buyer", phone: "9999999999" };
    units[i].bookedAt = new Date();
  });
  return units;
}

async function run() {
  await connectDB();

  await Promise.all([
    GalleryItem.deleteMany({}),
    Video.deleteMany({}),
    Unit.deleteMany({}),
  ]);

  await GalleryItem.insertMany(galleryItems);
  await Video.insertMany(videos);
  await Unit.insertMany(buildUnits());

  console.log("[seed] done: gallery, videos, and inventory seeded");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
