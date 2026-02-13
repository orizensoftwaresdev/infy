// src/constants/vibeData.js

export const genderOptions = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
];

export const bodyTypes = {
  female: [
    { label: "Rectangle", img: "/images/bodytypes/rectangle.jpeg" },
    { label: "Pear", img: "/images/bodytypes/pear.jpeg" },
    { label: "Apple", img: "/images/bodytypes/apple.jpeg" }, // Ensure your image is apple.jpeg
    { label: "Hourglass", img: "/images/bodytypes/hourglass.jpeg" },
    { label: "Inverted Triangle", img: "/images/bodytypes/inverted.jpeg" },
  ],
  male: [
    { label: "Slim Build", img: "/images/bodytypes/slim.jpeg" }, // Ensure image exists
    { label: "Muscular Build", img: "/images/bodytypes/muscular.jpeg" }, // Ensure image exists
    { label: "Broader Build", img: "/images/bodytypes/broader.jpeg" } // Ensure image exists
  ],
};

export const sizes = ["XS", "S", "M", "L", "XL", "XXL", "+Size"];

export const occasions = [
  "Casual", "Formal", "Party", "Vacation", "Workout",
  "Traditional", "Professional", "Date Night", "Travel",
  "Getaways", "Sports", "Gym", "Office wear", "Weddings",
  "Festivals", "Family Celebrations", "Night Parties/Clubbing",
  "Dinner date", "Evening Parties", "Beach or Resort", "Meetups",
  "College/School", "Weekend Outings", "Brunch", "Day Outs", "Clubbing", "Romantic Dinners", "Temple wear", "Casual hangouts", "Casual Summer", "Fusion Events", "Engagements", "Photoshoots"
];