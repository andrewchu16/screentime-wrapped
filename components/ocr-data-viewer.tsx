"use client";

import { useState, useEffect } from "react";
import { pipe, type OCRContent, type ContentItem } from "@screenpipe/browser";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface OCRDataViewerProps {
  onDataChange?: (data: any, error: string | null) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
}

export function OCRDataViewer({ 
  onDataChange, 
  autoRefresh = false, 
  refreshInterval = 5000,
  limit = 5
}: OCRDataViewerProps) {
  const [ocrData, setOcrData] = useState<OCRContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { toast } = useToast();

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const fetchData = () => {
      fetchOCRData();
    };
    
    // Initial fetch
    fetchData();
    
    // Set up interval
    const intervalId = setInterval(fetchData, refreshInterval);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval]);

  const fetchOCRData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching OCR data (limit: ${limit})...`);
      
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
      
      const startTime = performance.now();
      const result = await pipe.queryScreenpipe({
        contentType: "ocr",
        limit: limit,
      });
      const requestTime = performance.now() - startTime;
      console.log(`OCR data fetched in ${requestTime.toFixed(2)}ms`);
      
      // Restore original console.error
      console.error = originalConsoleError;
      
      // Pass the raw response to the parent component
      if (onDataChange) {
        onDataChange(result, null);
      }
      
      if (!result || !result.data || result.data.length === 0) {
        console.log("No OCR data found");
        const errorMsg = "No OCR data available";
        setError(errorMsg);
        if (onDataChange) {
          onDataChange(null, errorMsg);
        }
        return;
      }
      
      // Process the OCR data
      const ocrItems = result.data
        .filter(item => item.type === "OCR")
        .map(item => (item as ContentItem & { type: "OCR" }).content);
      
      console.log(`Retrieved ${ocrItems.length} OCR items`);
      setOcrData(ocrItems);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching OCR data:", error);
      const errorMessage = error instanceof Error 
        ? `Failed to fetch OCR data: ${error.message}`
        : "Failed to fetch OCR data";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Pass the error to the parent component
      if (onDataChange) {
        onDataChange(null, errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderOcrContent = (ocrItem: OCRContent, index: number) => {
    return (
      <Card key={`ocr-${index}`} className="mb-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">
            {ocrItem.appName || "Unknown App"} - {new Date(ocrItem.timestamp).toLocaleTimeString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="space-y-2 text-xs">
            <div className="flex flex-col text-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Window: </span>
                  <span>{ocrItem.windowName || "Unknown"}</span>
                </div>
                <div>
                  <span className="font-semibold">Time: </span>
                  <span>{new Date(ocrItem.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded p-2 overflow-auto max-h-[150px] whitespace-pre-wrap font-mono text-xs">
              {ocrItem.text || "No text content"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          onClick={fetchOCRData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh OCR Data
            </>
          )}
        </Button>
        
        {lastRefresh && (
          <span className="text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {isLoading && <Progress value={50} className="h-1" />}
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-3">
            <p className="text-xs text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {ocrData.length > 0 ? (
        <div className="space-y-2">
          {ocrData.map((item, index) => renderOcrContent(item, index))}
        </div>
      ) : !error && !isLoading ? (
        <Card className="bg-slate-50">
          <CardContent className="py-3 text-center">
            <p className="text-sm text-slate-500">No OCR data available. Click refresh to fetch data.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
} 