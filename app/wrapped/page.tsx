"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { pipe } from "@screenpipe/browser";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/animated-background";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import the ScreenTimePresentation component
const ScreenTimePresentation = dynamic(() => import("@/components/screen-time-presentation"), { ssr: false });

// Define the interface for Screenpipe response
interface ScreenpipeResponse {
  data: any[];
}

// Mock data for when Screenpipe is not available
const MOCK_DATA = {
  appUsage: [
    { name: "VS Code", timeSpent: 7200, sessions: 5 },
    { name: "Chrome", timeSpent: 5400, sessions: 12 },
    { name: "Slack", timeSpent: 3600, sessions: 8 },
    { name: "Spotify", timeSpent: 2700, sessions: 3 },
    { name: "Terminal", timeSpent: 1800, sessions: 10 }
  ],
  websiteUsage: [
    { name: "github.com", timeSpent: 3600, visits: 15 },
    { name: "stackoverflow.com", timeSpent: 2700, visits: 8 },
    { name: "docs.microsoft.com", timeSpent: 1800, visits: 6 },
    { name: "youtube.com", timeSpent: 1500, visits: 4 },
    { name: "chat.openai.com", timeSpent: 1200, visits: 5 }
  ],
  textContent: "This is mock text content for your screen time wrapped presentation.",
  rawUiRecords: [],
  rawOcrRecords: []
};

export default function WrappedPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isScreenpipeAvailable, setIsScreenpipeAvailable] = useState(true);
  const [screenTimeData, setScreenTimeData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const checkScreenpipeAvailability = useCallback(async () => {
    setIsLoading(true);
    setLoadingProgress(10);
    
    try {
      // Try to ping Screenpipe server
      const response = await fetch("http://localhost:3030/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoadingProgress(30);
      
      if (!response.ok) {
        setIsScreenpipeAvailable(false);
        toast({
          title: "Screenpipe Not Available",
          description: "We&apos;ll use mock data for your presentation.",
          variant: "destructive",
        });
      } else {
        setIsScreenpipeAvailable(true);
      }

      setLoadingProgress(50);
      
    } catch (error) {
      console.error("Error checking Screenpipe availability:", error);
      setIsScreenpipeAvailable(false);
      toast({
        title: "Screenpipe Not Available",
        description: "We&apos;ll use mock data for your presentation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  }, [toast]);

  useEffect(() => {
    // Check if API key exists
    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      router.push("/");
      return;
    }

    // Check if Screenpipe is available
    checkScreenpipeAvailability();
  }, [checkScreenpipeAvailability, router]);

  const handleStartPresentation = async () => {
    setIsStarted(true);
    setIsLoading(true);
    setLoadingProgress(10);

    try {
      const data = await fetchScreenTimeData();
      setScreenTimeData(data);
    } catch (error) {
      console.error("Error fetching screen time data:", error);
      setErrorMessage("Failed to fetch screen time data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch screen time data. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
      setLoadingProgress(100);
    }
  };

  const fetchScreenTimeData = async () => {
    setLoadingProgress(30);
    
    // If Screenpipe is not available, return mock data
    if (!isScreenpipeAvailable) {
      console.log("Screenpipe not available, using mock data");
      setLoadingProgress(100);
      return MOCK_DATA;
    }

    try {
      // Add error handling for the analytics connection issue
      const originalConsoleError = console.error;
      console.error = function(msg, ...args) {
        // Filter out the analytics connection errors
        if (typeof msg === 'string' && 
           (msg.includes('failed to fetch settings') || 
            msg.includes('ERR_CONNECTION_REFUSED'))) {
          // Suppress these specific errors
          console.log("Suppressed error:", msg);
          return;
        }
        originalConsoleError.apply(console, [msg, ...args]);
      };

      // Fetch UI records from Screenpipe
      console.log("Fetching UI records...");
      let uiRecords = [];
      try {
        const startTimeUI = performance.now();
        const uiRecordsResponse = await pipe.queryScreenpipe({
          contentType: "ui",
          limit: 1000,
        }) as ScreenpipeResponse | null;
        const requestTimeUI = performance.now() - startTimeUI;
        console.log(`UI records fetched in ${requestTimeUI.toFixed(2)}ms`);
        
        uiRecords = uiRecordsResponse?.data || [];
        console.log(`Retrieved ${uiRecords.length} UI records`);
      } catch (uiError) {
        console.error("Error fetching UI records:", uiError);
        toast({
          title: "Warning",
          description: "Could not fetch UI records. Will try to use OCR records as fallback.",
          variant: "destructive",
        });
      }

      setLoadingProgress(50);

      // Fetch OCR records from Screenpipe
      console.log("Fetching OCR records...");
      let ocrRecords = [];
      try {
        const startTimeOCR = performance.now();
        const ocrRecordsResponse = await pipe.queryScreenpipe({
          contentType: "ocr",
          limit: 1000,
        }) as ScreenpipeResponse | null;
        const requestTimeOCR = performance.now() - startTimeOCR;
        console.log(`OCR records fetched in ${requestTimeOCR.toFixed(2)}ms`);
        
        ocrRecords = ocrRecordsResponse?.data || [];
        console.log(`Retrieved ${ocrRecords.length} OCR records`);
      } catch (ocrError) {
        console.error("Error fetching OCR records:", ocrError);
        toast({
          title: "Warning",
          description: "Could not fetch OCR records. Some data may be missing.",
          variant: "destructive",
        });
      }

      // Restore original console.error
      console.error = originalConsoleError;

      setLoadingProgress(70);

      // If both record types are empty, fall back to mock data
      if (uiRecords.length === 0 && ocrRecords.length === 0) {
        console.log("No records found, using mock data");
        toast({
          title: "No Data Found",
          description: "Using sample data for your presentation.",
          variant: "destructive",
        });
        return MOCK_DATA;
      }

      let appUsage;
      let websiteUsage;
      
      // Process app and website usage data
      if (uiRecords.length > 0) {
        // If UI records are available, use them
        console.log("Using UI records for app and website usage");
        appUsage = processAppUsage(uiRecords);
        websiteUsage = processWebsiteUsage(uiRecords);
      } else if (ocrRecords.length > 0) {
        // If UI records are not available but OCR records are, use OCR records as fallback
        console.log("Using OCR records as fallback for app and website usage");
        appUsage = processAppUsageFromOCR(ocrRecords);
        websiteUsage = processWebsiteUsageFromOCR(ocrRecords);
      } else {
        // If neither is available, use mock data
        appUsage = MOCK_DATA.appUsage;
        websiteUsage = MOCK_DATA.websiteUsage;
      }
      
      // Extract text content from OCR records
      const textContent = extractTextContent(ocrRecords);

      setLoadingProgress(90);

      // Return the processed data
      return {
        appUsage,
        websiteUsage,
        textContent,
        rawUiRecords: uiRecords,
        rawOcrRecords: ocrRecords,
      };
    } catch (error) {
      console.error("Error fetching screen time data:", error);
      // Return mock data if there's an error
      toast({
        title: "Error",
        description: "Failed to fetch screen time data. Using mock data instead.",
        variant: "destructive",
      });
      return MOCK_DATA;
    }
  };

  const processAppUsage = (uiRecords: any[] = []) => {
    // Group records by app name
    const appUsageMap = new Map();
    
    uiRecords.forEach(record => {
      if (record.window_name) {
        const appName = record.window_name.split(' - ')[0];
        
        if (!appUsageMap.has(appName)) {
          appUsageMap.set(appName, {
            name: appName,
            timeSpent: 0,
            sessions: 0
          });
        }
        
        const app = appUsageMap.get(appName);
        app.timeSpent += 1; // Each record represents 1 second
        app.sessions += 1;
      }
    });
    
    // Convert map to array and sort by time spent
    const appUsage = Array.from(appUsageMap.values())
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 10); // Get top 10 apps
    
    // If we don't have enough real data, use mock data
    if (appUsage.length === 0) {
      return MOCK_DATA.appUsage;
    }
    
    return appUsage;
  };

  const processWebsiteUsage = (uiRecords: any[] = []) => {
    // Group records by website
    const websiteUsageMap = new Map();
    
    uiRecords.forEach(record => {
      if (record.window_name && record.window_name.includes(' - ')) {
        const windowName = record.window_name;
        const websiteName = extractWebsiteName(windowName);
        
        if (websiteName && !websiteUsageMap.has(websiteName)) {
          websiteUsageMap.set(websiteName, {
            name: websiteName,
            timeSpent: 0,
            visits: 0
          });
        }
        
        if (websiteName) {
          const website = websiteUsageMap.get(websiteName);
          website.timeSpent += 1; // Each record represents 1 second
          website.visits += 1;
        }
      }
    });
    
    // Convert map to array and sort by time spent
    const websiteUsage = Array.from(websiteUsageMap.values())
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 10); // Get top 10 websites
    
    // If we don't have enough real data, use mock data
    if (websiteUsage.length === 0) {
      return MOCK_DATA.websiteUsage;
    }
    
    return websiteUsage;
  };

  const extractWebsiteName = (windowName: string) => {
    // Common browser patterns
    const patterns = [
      /(\S+\.\S+) - Google Chrome/,
      /(\S+\.\S+) - Mozilla Firefox/,
      /(\S+\.\S+) - Microsoft Edge/,
      /(\S+\.\S+) - Safari/,
      /(\S+\.\S+) - Opera/,
      /(\S+\.\S+) - Brave/
    ];
    
    for (const pattern of patterns) {
      const match = windowName.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Function to extract text content from OCR records
  const extractTextContent = function(ocrRecords: any[] = []): string {
    // Extract text from OCR records
    const textContent = ocrRecords
      .map(record => record.content?.text || '')
      .filter(Boolean)
      .join(' ');

    // If we don't have enough real data, use mock data
    if (!textContent || textContent.length < 10) {
      console.log("No text content found");
      return MOCK_DATA.textContent;
    }
    
    return textContent;
  };

  // Process app usage from OCR records
  const processAppUsageFromOCR = (ocrRecords: any[] = []): Array<{name: string; timeSpent: number; sessions: number}> => {
    // Group records by app name
    const appUsageMap = new Map();
    
    ocrRecords.forEach(record => {
      if (record.content && record.content.appName) {
        const appName = record.content.appName;
        
        if (!appUsageMap.has(appName)) {
          appUsageMap.set(appName, {
            name: appName,
            timeSpent: 0,
            sessions: 0
          });
        }
        
        const app = appUsageMap.get(appName);
        app.timeSpent += 5; // Each OCR record might represent ~5 seconds
        app.sessions += 1;
      }
    });
    
    // Convert map to array and sort by time spent
    const appUsage = Array.from(appUsageMap.values())
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 10); // Get top 10 apps
    
    // If we don't have enough real data, use mock data
    if (appUsage.length === 0) {
      return MOCK_DATA.appUsage;
    }
    
    return appUsage;
  };

  // Process website usage from OCR records
  const processWebsiteUsageFromOCR = (ocrRecords: any[] = []): Array<{name: string; timeSpent: number; visits: number}> => {
    // Group records by website
    const websiteUsageMap = new Map();
    
    ocrRecords.forEach(record => {
      if (record.content && record.content.windowName) {
        const windowName = record.content.windowName;
        const websiteName = extractWebsiteName(windowName);
        
        if (websiteName && !websiteUsageMap.has(websiteName)) {
          websiteUsageMap.set(websiteName, {
            name: websiteName,
            timeSpent: 0,
            visits: 0
          });
        }
        
        if (websiteName) {
          const website = websiteUsageMap.get(websiteName);
          website.timeSpent += 5; // Each OCR record might represent ~5 seconds
          website.visits += 1;
        }
      }
    });
    
    // Try to extract websites from OCR text content if we don't have enough data
    if (websiteUsageMap.size < 3) {
      ocrRecords.forEach(record => {
        if (record.content && record.content.text) {
          // Look for URLs in the OCR text
          const urlMatches = record.content.text.match(/https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
          if (urlMatches) {
            urlMatches.forEach((url: string) => {
              try {
                const hostname = new URL(url).hostname;
                
                if (!websiteUsageMap.has(hostname)) {
                  websiteUsageMap.set(hostname, {
                    name: hostname,
                    timeSpent: 0,
                    visits: 0
                  });
                }
                
                const website = websiteUsageMap.get(hostname);
                website.timeSpent += 5;
                website.visits += 1;
              } catch (e) {
                // Invalid URL, skip
              }
            });
          }
        }
      });
    }
    
    // Convert map to array and sort by time spent
    const websiteUsage = Array.from(websiteUsageMap.values())
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 10); // Get top 10 websites
    
    // If we don't have enough real data, use mock data
    if (websiteUsage.length === 0) {
      return MOCK_DATA.websiteUsage;
    }
    
    return websiteUsage;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isScreenpipeAvailable) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-center mb-6">Screenpipe not available</p>
            <Button onClick={() => router.push("/")}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      <AnimatedBackground />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {!isStarted ? (
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[80vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 gradient-text">
                Your Screen Time Wrapped
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full max-w-md"
            >
              <Card className="card-animated backdrop-blur-sm bg-black/30 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-white">Ready to see your digital day?</CardTitle>
                  <CardDescription className="text-center text-white/70">
                    We&apos;ll analyze your screen time and create a personalized presentation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Spinner className="h-5 w-5 text-white" />
                        <p className="text-sm text-white/70">Checking Screenpipe availability...</p>
                      </div>
                      <div className="progress-animated">
                        <Progress value={loadingProgress} className="h-2 bg-white/10" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!isScreenpipeAvailable && (
                        <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Screenpipe Not Available</AlertTitle>
                          <AlertDescription>
                            We&apos;ll use mock data for your presentation.
                          </AlertDescription>
                        </Alert>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button 
                          onClick={handleStartPresentation} 
                          className="w-full button-bounce bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                          disabled={isLoading}
                        >
                          {isLoading ? "Preparing..." : "Start My Presentation"}
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <div className="pt-4">
            {screenTimeData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ScreenTimePresentation data={screenTimeData} />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 