"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";

interface ScreenTimePresentationProps {
  data: {
    appUsage: Array<{
      name: string;
      timeSpent: number;
      sessions: number;
    }>;
    websiteUsage: Array<{
      name: string;
      timeSpent: number;
      visits: number;
    }>;
    textContent: string;
    rawUiRecords: any[];
    rawOcrRecords: any[];
  };
}

interface Slide {
  title: string;
  content: string;
  type: "text" | "appUsage" | "websiteUsage" | "insight";
  data?: any;
}

export default function ScreenTimePresentation({ data }: ScreenTimePresentationProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    generatePresentation();
  }, []);

  const generatePresentation = async () => {
    try {
      setLoading(true);
      
      // Create initial slides with loading state
      const initialSlides: Slide[] = [
        {
          title: "Welcome to Your Screen Time Wrapped",
          content: "Analyzing your digital day...",
          type: "text"
        },
        {
          title: "Your Top Apps",
          content: "Discovering your most-used applications...",
          type: "appUsage",
          data: data.appUsage
        },
        {
          title: "Your Web Wanderings",
          content: "Mapping your online journey...",
          type: "websiteUsage",
          data: data.websiteUsage
        }
      ];
      
      setSlides(initialSlides);
      
      // Get API key from localStorage
      const apiKey = localStorage.getItem("geminiApiKey");
      if (!apiKey) {
        throw new Error("API key not found");
      }
      
      // Prepare data for Gemini
      const appUsageSummary = data.appUsage.map(app => 
        `${app.name}: ${formatTime(app.timeSpent)} (${app.sessions} sessions)`
      ).join("\n");
      
      const websiteUsageSummary = data.websiteUsage.map(site => 
        `${site.name}: ${formatTime(site.timeSpent)} (${site.visits} visits)`
      ).join("\n");
      
      // Sample of text content (limit to avoid token limits)
      const textSample = data.textContent.slice(0, 5000);
      
      // Create prompt for Gemini
      const prompt = `
        You are creating a "Spotify Wrapped"-style presentation about someone's screen time usage.
        
        Here's data about their screen usage in the last 24 hours:
        
        TOP APPS:
        ${appUsageSummary}
        
        TOP WEBSITES:
        ${websiteUsageSummary}
        
        SAMPLE TEXT FROM SCREEN:
        ${textSample}
        
        Create a witty, engaging presentation with 7 slides:
        1. An introduction slide welcoming them to their Screen Time Wrapped
        2. A slide about their top apps with interesting observations
        3. A slide about their web browsing habits with interesting observations
        4. A slide with a surprising or interesting insight about their screen usage
        5. A slide with a personalized "digital personality" assessment based on their usage
        6. A slide with a fun prediction or recommendation based on their habits
        7. A closing slide thanking them for viewing their Screen Time Wrapped
        
        For each slide, provide:
        - A catchy title (max 10 words)
        - Engaging content (max 100 words)
        
        Be witty, conversational, and slightly humorous. Use emojis occasionally.
        Format your response as JSON with this structure:
        {
          "slides": [
            {
              "title": "slide title",
              "content": "slide content",
              "type": "text"
            }
          ]
        }
      `;
      
      // Update progress
      setGenerationProgress(20);
      
      // Define models to try in order of preference
      const modelsToTry = [
        {
          url: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
          name: "gemini-1.5-pro"
        },
        {
          url: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
          name: "gemini-pro"
        },
        {
          url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
          name: "gemini-pro (beta)"
        }
      ];
      
      let response = null;
      let lastError = null;
      
      // Try each model in sequence until one works
      for (const model of modelsToTry) {
        try {
          console.log(`Trying Gemini model: ${model.name}`);
          
          // Call Gemini API
          response = await fetch(model.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
              }
            })
          });
          
          if (response.ok) {
            console.log(`Successfully used model: ${model.name}`);
            break; // Exit the loop if successful
          } else {
            const errorData = await response.json();
            lastError = `${model.name}: ${errorData.error?.message || response.statusText}`;
            console.warn(`Failed with model ${model.name}:`, lastError);
          }
        } catch (err) {
          lastError = `${model.name}: ${err instanceof Error ? err.message : String(err)}`;
          console.warn(`Error with model ${model.name}:`, lastError);
        }
      }
      
      // Update progress
      setGenerationProgress(60);
      
      if (!response || !response.ok) {
        throw new Error(`All Gemini API models failed. Last error: ${lastError}`);
      }
      
      const responseData = await response.json();
      
      // Update progress
      setGenerationProgress(80);
      
      // Parse the response
      const responseText = responseData.candidates[0]?.content?.parts[0]?.text;
      if (!responseText) {
        throw new Error("No response from Gemini API");
      }
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse JSON from response");
      }
      
      const presentationData = JSON.parse(jsonMatch[0]);
      
      // Create final slides
      const generatedSlides = presentationData.slides.map((slide: any) => ({
        title: slide.title,
        content: slide.content,
        type: slide.type || "text"
      }));
      
      // Add app and website usage data to specific slides
      const finalSlides = generatedSlides.map((slide: Slide, index: number) => {
        if (index === 1) {
          return { ...slide, type: "appUsage", data: data.appUsage };
        } else if (index === 2) {
          return { ...slide, type: "websiteUsage", data: data.websiteUsage };
        }
        return slide;
      });
      
      // Update progress
      setGenerationProgress(100);
      
      // Set the slides
      setSlides(finalSlides);
    } catch (err) {
      console.error("Error generating presentation:", err);
      setError(`Failed to generate presentation: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Error",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goHome = () => {
    router.push("/");
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {loading ? (
          <Card className="w-full max-w-3xl card-animated backdrop-blur-sm bg-black/30 border-white/10 text-white">
            <CardContent className="pt-6 flex flex-col items-center">
              <motion.h2 
                className="text-2xl font-bold mb-4 gradient-text"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Generating Your Screen Time Wrapped
              </motion.h2>
              <motion.p 
                className="text-center mb-6 text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Our AI is analyzing your screen time data and creating a personalized presentation...
              </motion.p>
              <motion.div 
                className="w-full mb-4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Progress value={generationProgress} className="h-2 progress-animated bg-white/10" />
              </motion.div>
              <motion.p 
                className="text-sm text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {generationProgress < 30 ? "Analyzing your data..." : 
                 generationProgress < 70 ? "Creating your personalized insights..." : 
                 "Finalizing your presentation..."}
              </motion.p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-3xl card-animated backdrop-blur-sm bg-black/30 border-white/10 text-white">
            <CardContent className="pt-6 flex flex-col items-center">
              <motion.h2 
                className="text-xl font-bold text-red-500 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Error
              </motion.h2>
              <motion.p 
                className="text-center mb-6 text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {error}
              </motion.p>
              <motion.div 
                className="space-y-4 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="bg-red-900/30 border border-red-500/30 rounded-md p-4">
                  <h3 className="font-medium text-red-300 mb-2">Troubleshooting Tips:</h3>
                  <ul className="list-disc pl-5 text-sm text-red-200 space-y-1">
                    <li>Check that your Gemini API key is valid and has not expired</li>
                    <li>Ensure you have sufficient quota remaining on your Gemini API account</li>
                    <li>Try again in a few minutes as the service might be temporarily unavailable</li>
                    <li>Check if you need to enable the Gemini API in your Google Cloud Console</li>
                  </ul>
                </div>
                <div className="flex space-x-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={generatePresentation} variant="outline" className="bg-white/10 text-white border-white/20">
                      Try Again
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={goHome} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
                      Go Back
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="pt-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Generating Your Screen Time Wrapped</h2>
            <p className="text-center mb-6">
              Our AI is analyzing your screen time data and creating a personalized presentation...
            </p>
            <Progress value={generationProgress} className="w-full mb-4" />
            <p className="text-sm text-muted-foreground">
              {generationProgress < 30 ? "Analyzing your data..." : 
               generationProgress < 70 ? "Creating your personalized insights..." : 
               "Finalizing your presentation..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {loading ? (
        <Card className="w-full max-w-3xl card-animated backdrop-blur-sm bg-black/30 border-white/10 text-white">
          <CardContent className="pt-6 flex flex-col items-center">
            <motion.h2 
              className="text-2xl font-bold mb-4 gradient-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Generating Your Screen Time Wrapped
            </motion.h2>
            <motion.p 
              className="text-center mb-6 text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Our AI is analyzing your screen time data and creating a personalized presentation...
            </motion.p>
            <motion.div 
              className="w-full mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Progress value={generationProgress} className="h-2 progress-animated bg-white/10" />
            </motion.div>
            <motion.p 
              className="text-sm text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {generationProgress < 30 ? "Analyzing your data..." : 
               generationProgress < 70 ? "Creating your personalized insights..." : 
               "Finalizing your presentation..."}
            </motion.p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="w-full max-w-3xl card-animated backdrop-blur-sm bg-black/30 border-white/10 text-white">
          <CardContent className="pt-6 flex flex-col items-center">
            <motion.h2 
              className="text-xl font-bold text-red-500 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Error
            </motion.h2>
            <motion.p 
              className="text-center mb-6 text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {error}
            </motion.p>
            <motion.div 
              className="space-y-4 w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="bg-red-900/30 border border-red-500/30 rounded-md p-4">
                <h3 className="font-medium text-red-300 mb-2">Troubleshooting Tips:</h3>
                <ul className="list-disc pl-5 text-sm text-red-200 space-y-1">
                  <li>Check that your Gemini API key is valid and has not expired</li>
                  <li>Ensure you have sufficient quota remaining on your Gemini API account</li>
                  <li>Try again in a few minutes as the service might be temporarily unavailable</li>
                  <li>Check if you need to enable the Gemini API in your Google Cloud Console</li>
                </ul>
              </div>
              <div className="flex space-x-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={generatePresentation} variant="outline" className="bg-white/10 text-white border-white/20">
                    Try Again
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={goHome} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
                    Go Back
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          className="w-full max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-black/30 border-white/10 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {/* Slide content */}
                <motion.div 
                  className="p-8"
                  key={`slide-${currentSlideIndex}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  {slides.length > 0 && (
                    <>
                      <motion.h2 
                        className="text-3xl font-bold mb-6 gradient-text"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        {slides[currentSlideIndex].title}
                      </motion.h2>
                      
                      {slides[currentSlideIndex].type === "text" && (
                        <motion.div 
                          className="text-lg text-white/80 whitespace-pre-line"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          {slides[currentSlideIndex].content}
                        </motion.div>
                      )}
                      
                      {slides[currentSlideIndex].type === "appUsage" && (
                        <motion.div 
                          className="space-y-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <p className="text-lg text-white/80 mb-4">{slides[currentSlideIndex].content}</p>
                          <div className="space-y-4">
                            {slides[currentSlideIndex].data?.slice(0, 5).map((app: any, index: number) => (
                              <motion.div 
                                key={app.name}
                                className="bg-white/10 rounded-lg p-4"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-medium text-white">{app.name}</h3>
                                  <span className="text-sm text-white/70">{formatTime(app.timeSpent)}</span>
                                </div>
                                <Progress value={(app.timeSpent / data.appUsage[0].timeSpent) * 100} className="h-2 bg-white/10" />
                                <p className="text-xs text-white/50 mt-1">{app.sessions} sessions</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {slides[currentSlideIndex].type === "websiteUsage" && (
                        <motion.div 
                          className="space-y-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <p className="text-lg text-white/80 mb-4">{slides[currentSlideIndex].content}</p>
                          <div className="space-y-4">
                            {slides[currentSlideIndex].data?.slice(0, 5).map((site: any, index: number) => (
                              <motion.div 
                                key={site.name}
                                className="bg-white/10 rounded-lg p-4"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-medium text-white">{site.name}</h3>
                                  <span className="text-sm text-white/70">{formatTime(site.timeSpent)}</span>
                                </div>
                                <Progress value={(site.timeSpent / data.websiteUsage[0].timeSpent) * 100} className="h-2 bg-white/10" />
                                <p className="text-xs text-white/50 mt-1">{site.visits} visits</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {slides[currentSlideIndex].type === "insight" && (
                        <motion.div 
                          className="text-lg text-white/80 bg-white/10 p-6 rounded-lg border border-white/20"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          {slides[currentSlideIndex].content}
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
                
                {/* Navigation controls */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={prevSlide} 
                        disabled={currentSlideIndex === 0}
                        variant="outline"
                        className="bg-white/10 text-white border-white/20"
                      >
                        Previous
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={nextSlide} 
                        disabled={currentSlideIndex === slides.length - 1}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                      >
                        Next
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white/50">
                      {currentSlideIndex + 1} / {slides.length}
                    </span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={goHome} 
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        Exit
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 