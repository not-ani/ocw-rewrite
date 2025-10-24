"use client"
import { memo, useState, useEffect } from "react";
import { Streamdown } from 'streamdown';

import { buttonVariants } from "@/components/ui/button";
import { Embed } from "../iframe";

export const GoogleDocsEmbed = memo(function GoogleDocsEmbed({
  embedId,
}: {
  embedId: string | null;
}) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  if (!embedId) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Invalid Google Docs Embed</p>
      </div>
    );
  }

  const fetchMarkdown = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/get-markdown?url=${encodeURIComponent(embedId)}`, {
        cache: "no-store",
      });
      const data = await response.json();
      
      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }
      
      setMarkdown(data.markdown);
    } catch (error) {
      console.error("Error fetching markdown:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkdown();
  }, [embedId]);

  return (
    <div className="flex h-screen flex-col max-h-[90vh]">

    
      <div className="flex flex-row items-center justify-between p-4">
          <div />
        <div className="flex gap-2">
          <a
            className={buttonVariants({
              variant: "default",
            })}
            href={embedId}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in new tab
          </a>
        </div>
      </div>

        <div className="border-t p-4  max-w-screen overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : markdown ? (
            <div className="prose prose-sm max-w-full bg-background">
              <Streamdown>
                {markdown}
              </Streamdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Failed to load markdown</p>
            </div>
          )}
        </div>
    </div>
  );
});
