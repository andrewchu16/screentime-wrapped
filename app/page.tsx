"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import AnimatedBackground from "@/components/animated-background";
import { motion } from "framer-motion";

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Store the API key in localStorage for now
      // In a production app, you might want to use a more secure method
      localStorage.setItem("geminiApiKey", apiKey);
      
      // Redirect to the wrapped page
      router.push("/wrapped");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="card-animated backdrop-blur-sm bg-black/30 border-white/10 text-white">
          <CardHeader>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold text-center gradient-text">Screen Time Wrapped</CardTitle>
            </motion.div>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardDescription className="text-center text-white/70">
                Discover insights about your screen usage habits
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-white">Gemini API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="text-xs text-gray-300 space-y-2">
                  <p>
                    Your API key is stored locally and is only used to generate insights about your screen time.
                  </p>
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-md p-3 mt-2">
                    <h3 className="font-medium text-blue-300 mb-1">How to get a Gemini API key:</h3>
                    <ol className="list-decimal pl-5 text-xs text-blue-200 space-y-1">
                      <li>Go to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click on "Get API key" in the top right</li>
                      <li>Create a new API key or use an existing one</li>
                      <li>Copy the API key and paste it here</li>
                    </ol>
                    <p className="mt-2 text-xs text-blue-200">
                      Make sure your API key has access to the Gemini models (gemini-pro or gemini-1.5-pro).
                    </p>
                  </div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  type="submit" 
                  className="w-full button-bounce bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue to Screen Time Wrapped"}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-400">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Powered by Screenpipe and Gemini
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
      <Toaster />
    </div>
  );
}
