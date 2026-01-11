import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import { ParserService, ParserServiceLive } from "./service";

const GOOGLE_DOC_URL =
  "https://docs.google.com/document/u/1/d/e/2PACX-1vRiFVCk9PsYXgXJWFW4HJn1eNVS5-6GeOSYwSlJOYUUXCfQzXwh3Qehou1k3YK0Xpr67ywsl0M6ArEK/pub";

const runParser = (html: string) =>
  Effect.gen(function* () {
    const parser = yield* ParserService;
    return yield* parser.parseHtmlToMarkdown(html);
  }).pipe(Effect.provide(ParserServiceLive), Effect.runPromise);

describe("ParserService", () => {
  describe("basic HTML conversion", () => {
    test("converts headings correctly", async () => {
      const html = `<main><h1>Title</h1><h2>Subtitle</h2></main>`;
      const result = await runParser(html);
      expect(result).toContain("# Title");
      expect(result).toContain("## Subtitle");
    });

    test("converts paragraphs", async () => {
      const html = `<main><p>Hello world</p><p>Second paragraph</p></main>`;
      const result = await runParser(html);
      expect(result).toContain("Hello world");
      expect(result).toContain("Second paragraph");
    });

    test("converts unordered lists", async () => {
      const html = `<main><ul><li>Item 1</li><li>Item 2</li></ul></main>`;
      const result = await runParser(html);
      // Turndown uses * for bullets
      expect(result).toContain("*   Item 1");
      expect(result).toContain("*   Item 2");
    });

    test("converts ordered lists", async () => {
      const html = `<main><ol><li>First</li><li>Second</li></ol></main>`;
      const result = await runParser(html);
      // Turndown uses two spaces after the number
      expect(result).toContain("1.  First");
      expect(result).toContain("2.  Second");
    });

    test("converts code blocks", async () => {
      const html = `<main><pre><code>const x = 1;</code></pre></main>`;
      const result = await runParser(html);
      expect(result).toContain("```");
      expect(result).toContain("const x = 1;");
    });

    test("converts inline code", async () => {
      const html = `<main><p>Use <code>console.log</code> to debug</p></main>`;
      const result = await runParser(html);
      expect(result).toContain("`console.log`");
    });

    test("converts links", async () => {
      const html = `<main><a href="https://example.com">Click here</a></main>`;
      const result = await runParser(html);
      expect(result).toContain("[Click here](https://example.com)");
    });

    test("converts bold text", async () => {
      const html = `<main><p><strong>Bold text</strong></p></main>`;
      const result = await runParser(html);
      expect(result).toContain("**Bold text**");
    });

    test("converts italic text", async () => {
      const html = `<main><p><em>Italic text</em></p></main>`;
      const result = await runParser(html);
      expect(result).toContain("_Italic text_");
    });
  });

  describe("content extraction", () => {
    test("extracts from <main>", async () => {
      const html = `<html><nav>Nav</nav><main>Main content</main></html>`;
      const result = await runParser(html);
      expect(result).toContain("Main content");
      expect(result).not.toContain("Nav");
    });

    test("extracts from <article>", async () => {
      const html = `<html><article>Article content</article><footer>Footer</footer></html>`;
      const result = await runParser(html);
      expect(result).toContain("Article content");
      expect(result).not.toContain("Footer");
    });

    test("falls back to body if no main/article", async () => {
      const html = `<html><body>Body content</body></html>`;
      const result = await runParser(html);
      expect(result).toContain("Body content");
    });
  });

  describe("junk removal", () => {
    test("removes script tags", async () => {
      const html = `<main><script>alert('bad')</script>Good content</main>`;
      const result = await runParser(html);
      expect(result).not.toContain("alert");
      expect(result).toContain("Good content");
    });

    test("removes style tags", async () => {
      const html = `<main><style>.bad { color: red; }</style>Good content</main>`;
      const result = await runParser(html);
      expect(result).not.toContain(".bad");
      expect(result).toContain("Good content");
    });

    test("removes nav elements", async () => {
      const html = `<body><nav>Navigation</nav><main>Main content</main></body>`;
      const result = await runParser(html);
      expect(result).not.toContain("Navigation");
    });

    test("removes footer elements", async () => {
      const html = `<body><main>Main content</main><footer>Footer</footer></body>`;
      const result = await runParser(html);
      expect(result).not.toContain("Footer");
    });

    test("removes aria-hidden elements", async () => {
      const html = `<main><div aria-hidden="true">Hidden</div>Visible</main>`;
      const result = await runParser(html);
      expect(result).not.toContain("Hidden");
      expect(result).toContain("Visible");
    });
  });

  describe("LaTeX image conversion", () => {
    test("converts images with LaTeX-like alt text", async () => {
      const html = `<main><img alt="x^2 + y^2 = z^2" src="formula.png" /></main>`;
      const result = await runParser(html);
      expect(result).toContain("$x^2 + y^2 = z^2$");
    });

    test("converts simple variable images", async () => {
      const html = `<main><img alt="E=mc^2" src="einstein.png" /></main>`;
      const result = await runParser(html);
      expect(result).toContain("$E=mc^2$");
    });

    test("does not convert images without LaTeX patterns", async () => {
      const html = `<main><img alt="A beautiful sunset" src="sunset.jpg" /></main>`;
      const result = await runParser(html);
      // Plain text should not be converted to LaTeX
      expect(result).not.toContain("$A beautiful sunset$");
      // The image should be converted to markdown image format
      expect(result).toContain("![A beautiful sunset]");
    });
  });

  describe("GFM features", () => {
    test("converts tables", async () => {
      const html = `
        <main>
          <table>
            <thead><tr><th>Name</th><th>Age</th></tr></thead>
            <tbody><tr><td>Alice</td><td>30</td></tr></tbody>
          </table>
        </main>`;
      const result = await runParser(html);
      expect(result).toContain("|");
      expect(result).toContain("Name");
      expect(result).toContain("Age");
    });

    test("converts strikethrough", async () => {
      const html = `<main><del>Deleted text</del></main>`;
      const result = await runParser(html);
      // GFM plugin uses single tildes for strikethrough
      expect(result).toContain("~Deleted text~");
    });

    test("converts task lists", async () => {
      const html = `
        <main>
          <ul>
            <li><input type="checkbox" checked>Done task</li>
            <li><input type="checkbox">Pending task</li>
          </ul>
        </main>`;
      const result = await runParser(html);
      expect(result).toContain("[x]");
      expect(result).toContain("[ ]");
    });
  });

  describe("error handling", () => {
    test("throws ParseError when no content found", async () => {
      const html = `<!DOCTYPE html><html><head></head></html>`;
      await expect(runParser(html)).rejects.toThrow();
    });
  });
});

describe("Google Doc Integration Test", () => {
  let fetchedHtml: string;

  beforeAll(async () => {
    const response = await fetch(GOOGLE_DOC_URL);
    fetchedHtml = await response.text();
  });

  test("parses Google Doc successfully", async () => {
    const result = await runParser(fetchedHtml);
    expect(result.length).toBeGreaterThan(100);
  });

  test("contains expected content from the China document", async () => {
    const result = await runParser(fetchedHtml);
    // Check for key terms from the document
    expect(result.toLowerCase()).toContain("china");
  });

  test("removes Google Docs scripts and styles", async () => {
    const result = await runParser(fetchedHtml);
    expect(result).not.toContain("google");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("<style");
  });

  test("preserves document structure", async () => {
    const result = await runParser(fetchedHtml);
    // Should have some markdown heading syntax
    expect(result).toMatch(/#+ /);
  });
});

describe("Performance Benchmarks", () => {
  const SMALL_HTML = `<main><h1>Title</h1><p>Content</p></main>`;
  const MEDIUM_HTML = `
    <main>
      <h1>Document Title</h1>
      ${Array(50).fill("<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>").join("\n")}
      <h2>Section 1</h2>
      ${Array(50).fill("<p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>").join("\n")}
    </main>
  `;
  const LARGE_HTML = `
    <main>
      <h1>Large Document</h1>
      ${Array(10)
        .fill(
          `
        <h2>Chapter</h2>
        ${Array(100).fill("<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>").join("\n")}
        <ul>${Array(20).fill("<li>List item with content</li>").join("")}</ul>
        <table><thead><tr><th>Col1</th><th>Col2</th></tr></thead><tbody><tr><td>Data</td><td>Data</td></tr></tbody></table>
      `
        )
        .join("\n")}
    </main>
  `;

  test("small HTML parses in under 20ms", async () => {
    const iterations = 100;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await runParser(SMALL_HTML);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Small HTML (${SMALL_HTML.length} bytes) avg: ${avg.toFixed(2)}ms`);
    expect(avg).toBeLessThan(20);
  });

  test("medium HTML parses in under 50ms", async () => {
    const iterations = 50;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await runParser(MEDIUM_HTML);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Medium HTML (${MEDIUM_HTML.length} bytes) avg: ${avg.toFixed(2)}ms`);
    expect(avg).toBeLessThan(50);
  });

  test("large HTML parses in under 200ms", async () => {
    const iterations = 10;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await runParser(LARGE_HTML);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Large HTML (${LARGE_HTML.length} bytes) avg: ${avg.toFixed(2)}ms`);
    expect(avg).toBeLessThan(200);
  });

  test("throughput benchmark - parses per second", async () => {
    const duration = 2000; // 2 seconds
    const start = performance.now();
    let count = 0;

    while (performance.now() - start < duration) {
      await runParser(SMALL_HTML);
      count++;
    }

    const elapsed = (performance.now() - start) / 1000;
    const opsPerSecond = count / elapsed;
    console.log(`Throughput: ${opsPerSecond.toFixed(1)} parses/second`);
    expect(opsPerSecond).toBeGreaterThan(50);
  });

  test("memory stability under repeated parsing", async () => {
    const iterations = 200;
    const memoryBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      await runParser(MEDIUM_HTML);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryDelta = (memoryAfter - memoryBefore) / 1024 / 1024;

    console.log(`Memory delta after ${iterations} iterations: ${memoryDelta.toFixed(2)}MB`);
    // Should not leak more than 50MB for 200 iterations
    expect(memoryDelta).toBeLessThan(50);
  });
});

describe("Comprehensive Google Doc Benchmark", () => {
  let fetchedHtml: string;

  beforeAll(async () => {
    const response = await fetch(GOOGLE_DOC_URL);
    fetchedHtml = await response.text();
  });

  test("Google Doc parsing performance", async () => {
    const iterations = 20;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await runParser(fetchedHtml);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = times.sort((a, b) => a - b);
    const p95 = sorted[Math.floor(times.length * 0.95)] ?? max;

    console.log("\n=== Google Doc Benchmark Results ===");
    console.log(`HTML size: ${(fetchedHtml.length / 1024).toFixed(2)} KB`);
    console.log(`Iterations: ${iterations}`);
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Min: ${min.toFixed(2)}ms`);
    console.log(`Max: ${max.toFixed(2)}ms`);
    console.log(`P95: ${p95.toFixed(2)}ms`);
    console.log("=====================================\n");

    // Google Docs pages are typically ~200-400KB, should parse in under 100ms
    expect(avg).toBeLessThan(100);
  });

  test("end-to-end fetch + parse benchmark", async () => {
    const iterations = 5;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const response = await fetch(GOOGLE_DOC_URL);
      const html = await response.text();
      await runParser(html);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`\nEnd-to-end (fetch + parse) avg: ${avg.toFixed(2)}ms`);

    // Network + parsing should be under 3 seconds
    expect(avg).toBeLessThan(3000);
  });
});
