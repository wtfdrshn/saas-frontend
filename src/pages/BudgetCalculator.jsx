import React, { useState } from "react";
import { motion } from "framer-motion";

const BudgetCalculator = () => {
  const [formData, setFormData] = useState({
    venue: 0,
    attendees: 0,
    fullDayCatering: 0,
    halfDayCatering: 0,
    photographyOnly: 0,
    videography: 0,
    fullEventRecording: 0,
    stageBackdrop: 0,
    backdropBanner: 0,
    rollUpBanner: 0,
    brandedCube32: 0,
    brandedCube50: 0,
    photoFrameProp: 0,
    trophies: 0,
    floorStickers: 0,
    waterBottleTags: 0,
    certificatePrinting: 0,
    giftBox: 0,
    totebagGiftSet: 0,
    powerBank: 0,
    waterBottle: 0,
    pens: 0,
    a5Notebook: 0,
    cottonToteBags: 0,
  });

  const [total, setTotal] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const calculateTotal = (e) => {
    e.preventDefault();
    const rates = {
      venue: 1,
      attendees: 100,
      fullDayCatering: 250,
      halfDayCatering: 200,
      photographyOnly: 3000,
      videography: 3500,
      fullEventRecording: 3000,
      stageBackdrop: 10000,
      backdropBanner: 4000,
      rollUpBanner: 300,
      brandedCube32: 750,
      brandedCube50: 1500,
      photoFrameProp: 350,
      trophies: 200,
      floorStickers: 45,
      waterBottleTags: 7,
      certificatePrinting: 20,
      giftBox: 400,
      totebagGiftSet: 35,
      powerBank: 85,
      waterBottle: 40,
      pens: 25,
      a5Notebook: 25,
      cottonToteBags: 35,
    };

    const calculatedTotal = Object.entries(formData).reduce((acc, [key, value]) => {
      return acc + (value * rates[key]);
    }, 0);

    setTotal(calculatedTotal);
    setShowSummary(true);
  };

  const renderInput = (label, field, emoji, unit = "") => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {emoji} {label} {unit && <span className="text-gray-500 text-xs">({unit})</span>}
      </label>
      <input
        type="number"
        min="0"
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl p-6 mt-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Event Budget Calculator
        </h1>

        <form onSubmit={calculateTotal} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Venue & Basic Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            {renderInput("Venue", "venue", "🏢", "INR")}
            {renderInput("Attendees", "attendees", "👥")}
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Catering</h3>
              {renderInput("Full Day Catering", "fullDayCatering", "🍽️", "days")}
              {renderInput("Half Day Catering", "halfDayCatering", "🥪", "days")}
            </div>
          </div>

          {/* Media Services */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Media Services</h2>
            {renderInput("Photography", "photographyOnly", "📸", "days")}
            {renderInput("Videography", "videography", "🎥", "days")}
            {renderInput("Full Event Recording", "fullEventRecording", "🎬", "days")}
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Branding</h3>
              {renderInput("Stage Backdrop", "stageBackdrop", "🎭", "units")}
              {renderInput("Backdrop Banner", "backdropBanner", "🖼️", "units")}
              {renderInput("Roll-Up Banner", "rollUpBanner", "📜", "units")}
            </div>
          </div>

          {/* Merchandise & Gifts */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Merchandise & Gifts</h2>
            {renderInput("Gift Box", "giftBox", "🎁", "units")}
            {renderInput("Tote Bag Gift Set", "totebagGiftSet", "👜", "units")}
            {renderInput("Power Bank", "powerBank", "🔋", "units")}
            {renderInput("Water Bottle", "waterBottle", "💧", "units")}
            {renderInput("Pens", "pens", "✒️", "units")}
            {renderInput("A5 Notebook", "a5Notebook", "📔", "units")}
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-fit bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Calculate Total Budget
            </button>
          </div>
        </form>

        {showSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gray-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Summary</h2>
            <div className="text-4xl font-bold text-indigo-600">
              ₹{total.toLocaleString()}
            </div>
            <p className="text-gray-500 mt-2">Estimated total budget</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BudgetCalculator; 