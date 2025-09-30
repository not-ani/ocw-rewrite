import { memo } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Embed } from "../iframe";

export const GoogleDocsEmbed = memo(function GoogleDocsEmbed({ 
  embedId 
}: { 
  embedId: string | null 
}) {
  if (!embedId) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Invalid Google Docs Embed</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Make the iframe take up most of the screen */}
      <Embed
        className="h-[87vh] w-full rounded-xl border-muted shadow-2xl"
        src={embedId}
      />

      {/* Keep the header section */}
      <div className="flex flex-row items-center justify-between p-4">
        <h3 className="font-bold text-3xl">Google Docs</h3>
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
  );
});
