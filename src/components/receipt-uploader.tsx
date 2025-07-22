"use client";

import Image from 'next/image';
import * as React from 'react';
import { UploadCloud, X, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  receiptImage: string | null;
  onReset: () => void;
}

export function ReceiptUploader({ onUpload, isLoading, receiptImage, onReset }: ReceiptUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">1. Upload Receipt</CardTitle>
        <CardDescription>Upload an image of your receipt to get started.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div 
          className="relative flex-1 flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50"
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            disabled={isLoading || !!receiptImage}
          />

          {isLoading ? (
             <div className="space-y-4 w-full">
                <Skeleton className="h-48 w-full" />
                <div className="flex items-center justify-center space-x-2 text-muted-foreground animate-pulse">
                    <RefreshCw className="h-5 w-5 animate-spin"/> 
                    <span>Processing receipt...</span>
                </div>
            </div>
          ) : receiptImage ? (
            <div className="relative w-full h-full">
              <Image
                src={receiptImage}
                alt="Uploaded Receipt"
                layout="fill"
                objectFit="contain"
                className="rounded-md"
              />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 z-10"
                onClick={(e) => { e.stopPropagation(); onReset(); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <UploadCloud className="h-12 w-12 text-gray-400" />
              <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
              <p className="text-sm">PNG, JPG, or WEBP</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
