"use client";

import { useState } from "react";
import { OCRDataViewer } from "@/components/ocr-data-viewer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OCRViewerPage() {
  const [rawData, setRawData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [limit, setLimit] = useState(5);
  const router = useRouter();
  
  const handleDataChange = (data: any, err: string | null) => {
    setRawData(data);
    setError(err);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">OCR Data Viewer</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>OCR Data</CardTitle>
              <CardDescription>
                View the latest OCR data captured by Screenpipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="viewer">
                <TabsList className="mb-4">
                  <TabsTrigger value="viewer">Viewer</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="viewer">
                  <OCRDataViewer 
                    onDataChange={handleDataChange}
                    autoRefresh={autoRefresh}
                    refreshInterval={refreshInterval}
                    limit={limit}
                  />
                </TabsContent>
                
                <TabsContent value="raw">
                  <div className="bg-slate-100 rounded p-4 overflow-auto max-h-[500px]">
                    <pre className="text-xs font-mono">
                      {error ? error : JSON.stringify(rawData, null, 2) || "No data available"}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure the OCR data viewer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh" className="flex flex-col">
                    <span>Auto Refresh</span>
                    <span className="text-xs text-slate-500">
                      Automatically refresh data
                    </span>
                  </Label>
                  <Switch 
                    id="auto-refresh" 
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">
                    Refresh Interval: {(refreshInterval / 1000).toFixed(1)}s
                  </Label>
                  <Slider
                    id="refresh-interval"
                    min={1000}
                    max={30000}
                    step={1000}
                    value={[refreshInterval]}
                    onValueChange={(value) => setRefreshInterval(value[0])}
                    disabled={!autoRefresh}
                  />
                  <p className="text-xs text-slate-500">
                    How often to refresh the data (1-30 seconds)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="limit">
                    Number of Records: {limit}
                  </Label>
                  <Slider
                    id="limit"
                    min={1}
                    max={20}
                    step={1}
                    value={[limit]}
                    onValueChange={(value) => setLimit(value[0])}
                  />
                  <p className="text-xs text-slate-500">
                    Number of OCR records to fetch (1-20)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Help</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>
                  This page demonstrates how to use the OCRDataViewer component to display OCR data from Screenpipe.
                </p>
                <p>
                  The component handles connection errors gracefully and provides options for auto-refreshing data.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Note: Screenpipe must be running for this to work. If you see errors, make sure Screenpipe is installed and running.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 