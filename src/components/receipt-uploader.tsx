
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
  isAuthLoading: boolean;
}

export function ReceiptUploader({ onUpload, isLoading, receiptImage, onReset, isAuthLoading }: ReceiptUploaderProps) {
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
    if (isLoading || receiptImage || isAuthLoading) return;
    fileInputRef.current?.click();
  };

  const isDisabled = isLoading || !!receiptImage || isAuthLoading;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>1. Upload Receipt</CardTitle>
        <CardDescription>Upload an image of your receipt to get started.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div 
          className="flex-1 flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors data-[disabled=false]:cursor-pointer data-[disabled=false]:hover:border-primary/50"
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          data-disabled={isDisabled}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            disabled={isDisabled}
          />

          {isAuthLoading ? (
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin"/> 
              <span>Connecting to history service...</span>
            </div>
          ) : isLoading ? (
             <div className="space-y-4 w-full">
                <Skeleton className="h-48 w-full" />
                <div className="flex items-center justify-center space-x-2 text-muted-foreground animate-pulse">
                    <RefreshCw className="h-5 w-5 animate-spin"/> 
                    <span>Processing receipt...</span>
                </div>
            </div>
          ) : receiptImage ? (
            <div className="relative w-full h-full min-h-[200px]">
                <Image
                    src={receiptImage}
                    alt="Uploaded Receipt"
                    fill={true}
                    style={{objectFit:"contain"}}
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
