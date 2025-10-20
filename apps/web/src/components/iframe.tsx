"use client";
import { LoaderCircleIcon } from "lucide-react";
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

type EmbedLoaderProps = {
  src: string;
  loaderComponent?: React.ReactNode;
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
};

const DEFAULT_TIMEOUT = 10_000; // 10 seconds
/*
 * TODO: we have  error managment but if any errors are present it stops the embed from rendering entirely and displays the error message.
 * we need to find a way to only stop the embed when there are breaking errors and not just when there are errors.
 */

export const Embed: React.FC<EmbedLoaderProps> = memo(function Embed({
  src: embedUrl,
  loaderComponent,
  timeout = DEFAULT_TIMEOUT,
  onLoad,
  onError,
  className,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set a timeout to trigger error if embed takes too long to load.
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
        if (onError) {
          onError(new Error("Embed load timed out"));
        }
      }
    }, timeout);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [timeout, isLoading, onError]);

  const handleLoad = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  const handleError = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(new Error("Failed to load embed"));
    }
  }, [onError]);

  return (
    <div className={className}>
      {isLoading && !hasError ? (
        <div aria-live="polite" className="loader" role="status">
          {loaderComponent ?? (
            <div className="bg-muted/20 flex h-full w-full flex-col items-center justify-center rounded-xl">
              <LoaderCircleIcon className="text-primary mb-4 h-8 w-8 animate-spin" />
              <div className="text-center">
                <p className="font-medium">Loading content...</p>
                <ul className="text-muted-foreground mt-2 text-sm">
                  <li>If this takes a long time, try turning off your VPN</li>
                  <li>Or click the "Open in new tab" button</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <iframe
        loading="eager"
        onError={handleError}
        onLoad={handleLoad}
        ref={iframeRef}
        src={embedUrl}
        style={{
          display: isLoading ? "none" : "block",
          width: "100%",
          height: "100%",
        }}
        title="Embedded Content"
        // Add security and performance attributes
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
});
