"use client";

import { useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { Upload, X, Camera, Loader2, UtensilsCrossed, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function UploadPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redirect if not authenticated
  if (!userLoading && !user) {
    router.push('/api/auth/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Camera functionality
  const startCamera = async () => {
    setShowCameraPreview(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera. Please check permissions.");
      setShowCameraPreview(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setShowCameraPreview(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setFiles(prev => [...prev, file]);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const analyzeImages = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus("uploading");

    try {
      // Create a FormData object to send the files
      const formData = new FormData();
      formData.append("file", files[0]); // For now, just analyze the first file

      // Send the request to the backend
      const response = await fetch("http://localhost:8000/analyze-image/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Set the analyzed image and detected items
      setAnalyzedImage(`data:image/jpeg;base64,${data.labeled_image}`);
      setDetectedItems(data.food_items || []);
      setUploadStatus("success");
    } catch (error) {
      console.error("Error analyzing images:", error);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const generateRecipe = () => {
    if (detectedItems.length > 0) {
      // Store detected items in session storage to use in recipe page
      sessionStorage.setItem('detectedIngredients', JSON.stringify(detectedItems));
      router.push('/recipe');
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-green-50">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full my-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              className="flex items-center text-green-700 hover:underline mr-4"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-green-800">Upload images</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
        
        {/* Camera preview modal */}
        {showCameraPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium">Take a Photo</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={stopCamera}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-auto"
                  style={{ maxHeight: '70vh' }}
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
              
              <div className="p-4 flex justify-center">
                <button 
                  className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center hover:bg-green-700"
                  onClick={capturePhoto}
                >
                  <Camera size={28} />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {uploadStatus === "success" && analyzedImage ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-green-700">Analysis Results</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Analyzed image with bounding boxes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-green-700">Analyzed Image</h3>
                  <div className="relative w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <Image 
                      src={analyzedImage}
                      alt="Analyzed fridge contents"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-2"
                    />
                  </div>
                </div>
                
                {/* Detected items list */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-green-700">Detected Items</h3>
                  {detectedItems.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                        {detectedItems.map((item, index) => (
                          <li key={index} className="flex items-center bg-white p-3 rounded-md shadow-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full mr-3"></span>
                            <span className="text-lg text-gray-800">{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <motion.button
                        className="mt-8 bg-green-600 text-white px-8 py-4 rounded-md text-lg font-medium flex items-center justify-center gap-2 w-full shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateRecipe}
                      >
                        <UtensilsCrossed size={22} />
                        Generate Recipe
                      </motion.button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-500 text-lg mb-4">No items detected. Try uploading a clearer image.</p>
                      <button 
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        onClick={() => {
                          setFiles([]);
                          setAnalyzedImage(null);
                          setDetectedItems([]);
                          setUploadStatus("idle");
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button 
                  className="text-green-700 border-2 border-green-600 px-6 py-3 rounded-md hover:bg-green-50 font-medium transition-colors"
                  onClick={() => {
                    setFiles([]);
                    setAnalyzedImage(null);
                    setDetectedItems([]);
                    setUploadStatus("idle");
                  }}
                >
                  Upload Another Image
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-green-700">Upload your fridge or pantry photos</h2>
              <p className="text-gray-600 mt-1">We'll analyze your images to identify ingredients for recipe suggestions</p>
            </div>
            
            <div className="p-6">
              {/* Upload area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/jpeg,image/png"
                  multiple
                />
                
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-green-100 p-5 rounded-full mb-6">
                    <Upload className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">
                    <span className="text-gray-700">Drag & drop images or</span> 
                    <span className="text-green-600 font-semibold cursor-pointer hover:underline ml-1" onClick={handleBrowseClick}>browse</span>
                  </h3>
                  <p className="text-gray-500 mb-6">JPG and PNG under 500 MB</p>
                  
                  <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={startCamera}
                  >
                    <Camera size={20} />
                    Take a Photo
                  </button>
                </div>
              </div>
              
              {/* File list */}
              {files.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">
                    {uploading ? "Uploading" : "Selected"} - {files.length} {files.length === 1 ? "File" : "Files"}
                  </h3>
                  
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 relative">
                            <Image 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        
                        <button 
                          className="text-gray-500 hover:text-red-500 p-2"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className={`mt-8 px-8 py-4 rounded-md text-lg font-medium flex items-center justify-center gap-2 w-full ${
                      uploading 
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    onClick={analyzeImages}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera size={22} />
                        Analyze Images
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {uploadStatus === "error" && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  <p className="font-medium">Error analyzing your images</p>
                  <p className="mt-1 text-sm">Please try again or upload a different image.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-green-200 mt-12 pt-6 pb-4">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Waste None. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 