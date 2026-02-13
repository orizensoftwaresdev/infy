// src/components/Hero.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleVibeCheck = () => {
    navigate("/vibecheck");
  };

  return (
    // This section now relies on the Layout to provide the background
    <section className="flex items-center justify-center w-full h-full">
      <div className="text-center bg-white bg-opacity-75 p-8 rounded-lg shadow-xl">
        <p className="text-sm text-blue-500 font-semibold tracking-wide uppercase mb-2">
          Hot Trend
        </p>
        <h1 className="text-5xl font-extrabold text-black mb-4">
          Fresh Fashion Finds
        </h1>
        <p className="text-2xl text-gray-700 mb-6">New Collection</p>
        <button
          className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleVibeCheck}
        >
          Vibe In. Style Out.
        </button>
      </div>
    </section>
  );
};

export default Hero;