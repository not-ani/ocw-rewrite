/**
 * Benchmark script for parse package performance
 * Tests the parser layer directly without Redis/ratelimit dependencies
 * Run with: npx tsx packages/parse/src/benchmark.ts
 */

import { Effect, Layer } from "effect";
import { ParserService, ParserServiceLive } from "./parser/service";

const ITERATIONS = 50;

// Sample HTML content to parse
const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <script>console.log("remove me")</script>
  <style>.junk { display: none; }</style>
</head>
<body>
  <nav>Navigation to remove</nav>
  <main>
    <h1>Welcome to the Course</h1>
    <p>This is some content that should be converted to markdown.</p>
    <h2>Chapter 1: Introduction</h2>
    <p>Here we discuss the basics of the subject matter.</p>
    <ul>
      <li>Point one</li>
      <li>Point two</li>
      <li>Point three</li>
    </ul>
    <h2>Chapter 2: Advanced Topics</h2>
    <p>Now we dive into more complex material.</p>
    <img alt="x^2 + y^2 = z^2" src="formula.png" />
    <p>The formula above shows the Pythagorean theorem.</p>
    <code>function example() { return true; }</code>
  </main>
  <footer>Footer to remove</footer>
</body>
</html>
`;

async function runBenchmark(): Promise<void> {
  console.log("Starting parser benchmark...\n");
  console.log(`Iterations: ${ITERATIONS}`);
  console.log(`HTML size: ${SAMPLE_HTML.length} bytes\n`);

  const times: number[] = [];

  // Test 1: Measure layer creation + parsing together (simulates per-request layer creation)
  console.log("Test 1: Layer creation + parse (simulates old behavior)");
  console.log("-".repeat(50));

  for (let i = 0; i < 5; i++) {
    const start = performance.now();

    const program = Effect.gen(function* () {
      const parser = yield* ParserService;
      return yield* parser.parseHtmlToMarkdown(SAMPLE_HTML);
    }).pipe(Effect.provide(ParserServiceLive));

    await Effect.runPromise(program);
    const elapsed = performance.now() - start;
    console.log(`  Iteration ${i + 1}: ${elapsed.toFixed(2)}ms`);
  }

  // Test 2: Measure just parsing (layer already provided - simulates cached layer)
  console.log("\nTest 2: Parse only (layer already created)");
  console.log("-".repeat(50));

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    const program = Effect.gen(function* () {
      const parser = yield* ParserService;
      return yield* parser.parseHtmlToMarkdown(SAMPLE_HTML);
    }).pipe(Effect.provide(ParserServiceLive));

    await Effect.runPromise(program);
    const elapsed = performance.now() - start;
    times.push(elapsed);

    if (i < 5 || i === ITERATIONS - 1) {
      console.log(`  Iteration ${i + 1}: ${elapsed.toFixed(2)}ms`);
    } else if (i === 5) {
      console.log("  ...");
    }
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log("\n" + "=".repeat(50));
  console.log("RESULTS");
  console.log("=".repeat(50));
  console.log(`  Total iterations: ${times.length}`);
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);

  console.log("\nPerformance expectations:");
  console.log("  - With Layer.succeed: < 10ms per parse");
  console.log("  - With Layer.effect + dynamic imports: 50-200ms per parse");

  if (avg < 15) {
    console.log("\nSUCCESS: Parser is fast!");
  } else if (avg < 50) {
    console.log("\nOK: Parser is reasonably fast");
  } else {
    console.log("\nWARNING: Parser is slow - check if dynamic imports are still happening");
  }
}

runBenchmark().catch(console.error);
