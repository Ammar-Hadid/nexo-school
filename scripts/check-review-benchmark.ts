import { benchmarkCases } from '../src/modules/content/review-benchmark/fixtures.ts';
import { simulateReviewBenchmark } from '../src/server/content/review-benchmark.ts';
console.log(
  JSON.stringify(
    { ...(await simulateReviewBenchmark()), reviewMaterial: benchmarkCases },
    null,
    2,
  ),
);
