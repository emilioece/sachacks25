"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Camera, UtensilsCrossed, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselControls = useAnimation();
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle Let's Cook button click
  const handleLetsCookClick = () => {
    if (user) {
      // If authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // If not authenticated, redirect to sign up
      window.location.href = '/api/auth/login?screen_hint=signup';
    }
  };
  
  // Recipe data with images
  const recipeCards = [
    { id: 1, title: "Bibimbap", image: "/recipes/bibimbap.jpg" },
    { id: 2, title: "Pupusa", image: "/recipes/pupusa.jpg" },
    { id: 3, title: "Dumplings", image: "/recipes/dumplings.jpg" },
    { id: 4, title: "Spring Rolls", image: "/recipes/spring_rolls.jpg" },
    { id: 5, title: "Pho", image: "/recipes/pho.jpg" }
  ];
  
  const calculateCardPosition = (index: number, activeIndex: number, total: number) => {
    const cardWidth = 144; // w-36 = 9rem = 144px
    const spacing = 40; // Gap between cards in pixels
    
    let relativeIndex = index - activeIndex;
    
    if (relativeIndex < -Math.floor(total / 2)) {
      relativeIndex += total;
    } else if (relativeIndex > Math.floor(total / 2)) {
      relativeIndex -= total;
    }
    
    const x = relativeIndex * (cardWidth + spacing);
    const y = -Math.abs(relativeIndex * 15);
    const zIndex = 10 - Math.abs(relativeIndex);
    
    // Determine if this is the center card
    const isCenter = relativeIndex === 0;
    
    // Base scale - center card is larger
    const scale = isCenter ? 1.2 : 1 - Math.abs(relativeIndex) * 0.05;
    const opacity = 1 - Math.abs(relativeIndex) * 0.2;
    const rotate = relativeIndex * 5;
    
    return { x, y, rotate, scale, opacity, zIndex, isCenter };
  };
  
  // Function to start auto-rotation
  const startAutoRotation = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    
    autoRotateRef.current = setInterval(() => {
      if (hoveredCard === null) {
        setActiveCardIndex((prev) => (prev + 1) % recipeCards.length);
      }
    }, 3000); // Rotate every 3 seconds
  };
  
  // Navigation functions
  const goToPrevious = () => {
    setActiveCardIndex((prev) => 
      prev === 0 ? recipeCards.length - 1 : prev - 1
    );
  };
  
  const goToNext = () => {
    setActiveCardIndex((prev) => 
      (prev + 1) % recipeCards.length
    );
  };

  // Start auto-rotation on component mount
  useEffect(() => {
    startAutoRotation();

    // Clean up interval on unmount
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [hoveredCard]);

  // Update carousel when active card changes
  useEffect(() => {
    carouselControls.start("visible");
  }, [activeCardIndex, carouselControls]);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-green-50">
      {/* Use the Navbar component instead of inline header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex flex-col items-center gap-6">
        {/* Recipe Generator Headline */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-green-800">
            Maximize your ingredients
          </h1>
          <p className="text-lg md:text-xl text-gray-600 flex items-center justify-center gap-2">
            <Camera className="text-green-600" size={20} />
            Take snap shots of what&apos;s left in your fridge/pantry
          </p>
        </div>

        {/* Recipe Carousel Animation - reduced vertical margins */}
        <div className="w-full max-w-5xl flex justify-center items-center my-8 relative h-80">
          {/* Left Arrow */}
          <motion.button 
            className="absolute left-4 z-20 bg-white/80 hover:bg-white text-green-700 p-2 rounded-full shadow-md"
            onClick={goToPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={24} />
          </motion.button>
          
          <motion.div 
            className="relative w-full h-full flex justify-center items-center"
            animate={carouselControls}
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
          >
            {recipeCards.map((item, index) => {
              const position = calculateCardPosition(index, activeCardIndex, recipeCards.length);
              const isHovered = hoveredCard === index;
              
              return (
                <motion.div 
                  key={item.id} 
                  className={`absolute flex flex-col items-center bg-white rounded-md shadow-sm cursor-pointer overflow-hidden border ${
                    position.isCenter ? 'border-green-300' : 'border-green-200'
                  }`}
                  style={{
                    width: position.isCenter ? '180px' : '144px',
                    height: position.isCenter ? '240px' : '192px',
                  }}
                  initial={{ 
                    x: position.x, 
                    y: position.y, 
                    rotate: position.rotate,
                    scale: position.scale,
                    opacity: position.opacity,
                    zIndex: position.zIndex
                  }}
                  animate={{ 
                    x: position.x, 
                    y: isHovered ? position.y - 10 : position.y, // Move up slightly when hovered
                    rotate: position.rotate,
                    scale: isHovered && !position.isCenter ? position.scale * 1.05 : position.scale,
                    opacity: position.opacity,
                    zIndex: isHovered ? 20 : position.zIndex,
                    boxShadow: position.isCenter || isHovered
                      ? "0px 10px 25px rgba(0, 0, 0, 0.15)" 
                      : "0px 2px 8px rgba(0, 0, 0, 0.05)"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => setActiveCardIndex(index)}
                >
                  <div className="relative w-full" style={{ height: position.isCenter ? '180px' : '144px' }}>
                    <Image 
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes={position.isCenter ? "180px" : "144px"}
                      style={{ objectFit: 'cover' }}
                      priority={index === activeCardIndex}
                    />
                  </div>
                  <div className={`p-2 text-center font-medium text-green-800 ${
                    position.isCenter ? 'text-base' : 'text-sm'
                  }`}>
                    {item.title}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Right Arrow */}
          <motion.button 
            className="absolute right-4 z-20 bg-white/80 hover:bg-white text-green-700 p-2 rounded-full shadow-md"
            onClick={goToNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={24} />
          </motion.button>
          
          {/* Carousel Indicators */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 justify-center">
            {recipeCards.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === activeCardIndex ? "bg-green-600" : "bg-gray-300"
                }`}
                onClick={() => setActiveCardIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Let's Cook Button - moved up with the carousel */}
        <motion.button 
          className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 rounded-full text-lg font-medium transition-colors shadow-md flex items-center gap-2 mt-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLetsCookClick}
        >
          <UtensilsCrossed size={20} />
          Let&apos;s Cook
        </motion.button>

        {/* Mission Statement */}
        <div className="w-full max-w-3xl mt-12 border-t border-green-200 pt-6">
          <h3 className="text-xl font-semibold text-center mb-4 text-green-800 flex items-center justify-center gap-2">
            <Leaf size={20} className="text-green-600" />
            Our Mission
          </h3>
          <p className="text-center text-gray-700">
            We aim to reduce food waste by helping you create delicious recipes with 
            ingredients you already have. Our app uses AI to analyze photos of your 
            fridge and pantry, suggesting creative ways to use items before they expire.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-green-200 mt-12 pt-6 pb-4">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} EcoEats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
