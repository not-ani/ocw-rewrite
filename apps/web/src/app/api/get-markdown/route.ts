import { NextResponse } from "next/server";
import TurndownService from "turndown";

export async function GET() {
  const url =
    "https://docs.google.com/document/d/e/2PACX-1vRJ5wxR0Wb8Jy2Lidb4Mwlx_ft1JGEnwz_K_vZxQlGpFAXpCN_ldty6kUGEJ5RxqiST89H35osgzb_r/pub";

  const response = await fetch(url);
  const html = await response.text();

  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(html);

  return NextResponse.json({ markdown });
}
