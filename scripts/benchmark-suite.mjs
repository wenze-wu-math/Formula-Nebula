#!/usr/bin/env node
/**
 * Performance Benchmark Suite
 * Includes:
 * - Memory profiling
 * - Computation benchmarks
 * - Rendering benchmarks
 *
 * Usage: node scripts/benchmark-suite.mjs
 */

import { performance } from 'perf_hooks';

const benchmarks = {};

function benchmark(name, fn, iterations = 1000) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);

  return {
    name,
    iterations,
    mean: times.reduce((a, b) => a + b) / times.length,
    median: times[Math.floor(times.length / 2)],
    min: times[0],
    max: times[times.length - 1],
    p95: times[Math.floor(times.length * 0.95)],
    p99: times[Math.floor(times.length * 0.99)],
    stdDev: Math.sqrt(
      times.reduce((sum, x) => sum + Math.pow(x - times.reduce((a, b) => a + b) / times.length, 2), 0) / times.length
    )
  };
}

console.log('╔════════════════════════════════════════════════════╗');
console.log('║  Formula Nebula - Benchmark Suite                 ║');
console.log('║  Memory + Computation + Rendering Benchmarks      ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════
// 1. MEMORY BENCHMARKS
// ═══════════════════════════════════════════════════════════════

console.log('🧠 MEMORY BENCHMARKS\n');

// Benchmark: Object creation
benchmarks.objectCreation = benchmark('Object Creation (100 objects)', () => {
  const objects = [];
  for (let i = 0; i < 100; i++) {
    objects.push({
      id: i,
      name: `object-${i}`,
      data: new Array(100).fill(Math.random()),
      nested: { x: Math.random(), y: Math.random(), z: Math.random() }
    });
  }
}, 500);

// Benchmark: Array operations
benchmarks.arrayOps = benchmark('Array Operations (push/splice)', () => {
  const arr = [];
  for (let i = 0; i < 1000; i++) arr.push(i);
  for (let i = 0; i < 100; i++) arr.splice(Math.random() * arr.length, 1);
  arr.reverse();
}, 100);

// Benchmark: String operations
benchmarks.stringOps = benchmark('String Concatenation', () => {
  let str = '';
  for (let i = 0; i < 1000; i++) {
    str += `value-${i},`;
  }
  return str.length;
}, 200);

// Benchmark: JSON parsing
benchmarks.jsonOps = benchmark('JSON Parse/Stringify', () => {
  const data = {
    nodes: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: `node-${i}`,
      value: Math.random()
    })),
    edges: Array.from({ length: 50 }, () => ({
      source: Math.floor(Math.random() * 100),
      target: Math.floor(Math.random() * 100)
    }))
  };
  const json = JSON.stringify(data);
  JSON.parse(json);
}, 300);

console.log('Memory Operation Benchmarks:');
Object.values(benchmarks).slice(0, 4).forEach(b => {
  console.log(`  ${b.name}`);
  console.log(`    Mean: ${b.mean.toFixed(4)}ms | Median: ${b.median.toFixed(4)}ms`);
  console.log(`    P95: ${b.p95.toFixed(4)}ms | P99: ${b.p99.toFixed(4)}ms`);
  console.log(`    Std Dev: ${b.stdDev.toFixed(4)}ms\n`);
});

// ═══════════════════════════════════════════════════════════════
// 2. COMPUTATION BENCHMARKS
// ═══════════════════════════════════════════════════════════════

console.log('\n📊 COMPUTATION BENCHMARKS\n');

// Benchmark: Matrix operations
benchmarks.matrixOps = benchmark('3x3 Matrix Multiplication', () => {
  const matrix1 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  const matrix2 = [
    [9, 8, 7],
    [6, 5, 4],
    [3, 2, 1]
  ];

  const result = [];
  for (let i = 0; i < 3; i++) {
    result[i] = [];
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += matrix1[i][k] * matrix2[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}, 1000);

// Benchmark: Graph operations (BFS)
benchmarks.graphBFS = benchmark('Graph BFS (100 nodes)', () => {
  const graph = {};
  for (let i = 0; i < 100; i++) {
    graph[i] = [];
    for (let j = 0; j < Math.random() * 5; j++) {
      graph[i].push(Math.floor(Math.random() * 100));
    }
  }

  const visited = new Set();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited.size;
}, 100);

// Benchmark: Sorting
benchmarks.sorting = benchmark('Array Sort (1000 items)', () => {
  const arr = Array.from({ length: 1000 }, () => Math.random());
  arr.sort((a, b) => a - b);
}, 200);

// Benchmark: Recursive computation
benchmarks.recursion = benchmark('Recursive Fibonacci (n=20)', () => {
  function fib(n) {
    return n <= 1 ? n : fib(n - 1) + fib(n - 2);
  }
  return fib(20);
}, 50);

console.log('Computation Benchmarks:');
Object.values(benchmarks).slice(4, 8).forEach(b => {
  console.log(`  ${b.name}`);
  console.log(`    Mean: ${b.mean.toFixed(4)}ms | Median: ${b.median.toFixed(4)}ms`);
  console.log(`    P95: ${b.p95.toFixed(4)}ms | P99: ${b.p99.toFixed(4)}ms`);
  console.log(`    Std Dev: ${b.stdDev.toFixed(4)}ms\n`);
});

// ═══════════════════════════════════════════════════════════════
// 3. THREE.JS MOCK BENCHMARKS
// ═══════════════════════════════════════════════════════════════

console.log('\n🎨 THREE.JS RENDERING BENCHMARKS\n');

// Benchmark: Vector operations
benchmarks.vectorOps = benchmark('Vector3 Math (normalize, add)', () => {
  const v1 = { x: Math.random(), y: Math.random(), z: Math.random() };
  const v2 = { x: Math.random(), y: Math.random(), z: Math.random() };

  const len = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  v1.x /= len; v1.y /= len; v1.z /= len;

  const result = {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z
  };
  return result;
}, 5000);

// Benchmark: Color operations
benchmarks.colorOps = benchmark('Color Conversion (RGB to HSL)', () => {
  const r = Math.random();
  const g = Math.random();
  const b = Math.random();

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h /= 6;

  return { h, s, l };
}, 2000);

// Benchmark: Geometry transformation
benchmarks.geometryTransform = benchmark('Geometry Transformation (100 vertices)', () => {
  const vertices = Array.from({ length: 100 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100
  }));

  const angle = Math.PI / 4;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  vertices.forEach(v => {
    const x = v.x * cos - v.y * sin;
    const y = v.x * sin + v.y * cos;
    v.x = x;
    v.y = y;
  });
}, 500);

console.log('Three.js Rendering Benchmarks:');
Object.values(benchmarks).slice(8).forEach(b => {
  console.log(`  ${b.name}`);
  console.log(`    Mean: ${b.mean.toFixed(4)}ms | Median: ${b.median.toFixed(4)}ms`);
  console.log(`    P95: ${b.p95.toFixed(4)}ms | P99: ${b.p99.toFixed(4)}ms`);
  console.log(`    Std Dev: ${b.stdDev.toFixed(4)}ms\n`);
});

// ═══════════════════════════════════════════════════════════════
// 4. SUMMARY STATISTICS
// ═══════════════════════════════════════════════════════════════

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║  BENCHMARK SUMMARY STATISTICS                      ║');
console.log('╚════════════════════════════════════════════════════╝\n');

const allBenchmarks = Object.values(benchmarks);
const avgMean = allBenchmarks.reduce((sum, b) => sum + b.mean, 0) / allBenchmarks.length;
const avgMedian = allBenchmarks.reduce((sum, b) => sum + b.median, 0) / allBenchmarks.length;

console.log('Overall Performance Metrics:');
console.log(`  Total Benchmarks Run: ${allBenchmarks.length}`);
console.log(`  Total Operations: ${allBenchmarks.reduce((sum, b) => sum + b.iterations, 0).toLocaleString()}`);
console.log(`  Average Mean Time: ${avgMean.toFixed(4)}ms`);
console.log(`  Average Median Time: ${avgMedian.toFixed(4)}ms\n`);

const fastest = allBenchmarks.reduce((min, b) => b.mean < min.mean ? b : min);
const slowest = allBenchmarks.reduce((max, b) => b.mean > max.mean ? b : max);

console.log(`  ⚡ Fastest Operation: ${fastest.name} (${fastest.mean.toFixed(4)}ms)`);
console.log(`  🐌 Slowest Operation: ${slowest.name} (${slowest.mean.toFixed(4)}ms)\n`);

// ═══════════════════════════════════════════════════════════════
// 5. PERFORMANCE GRADES
// ═══════════════════════════════════════════════════════════════

console.log('Performance Grades:');

function getGrade(ms) {
  if (ms < 0.1) return 'A+ (< 0.1ms)';
  if (ms < 0.5) return 'A (0.1-0.5ms)';
  if (ms < 1) return 'B (0.5-1ms)';
  if (ms < 5) return 'C (1-5ms)';
  if (ms < 10) return 'D (5-10ms)';
  return 'F (> 10ms)';
}

allBenchmarks.forEach(b => {
  const grade = getGrade(b.mean);
  console.log(`  ${b.name}: ${grade}`);
});

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║  Benchmark Suite Complete                          ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// Save results
const results = {
  timestamp: new Date().toISOString(),
  benchmarks: allBenchmarks.map(b => ({
    name: b.name,
    iterations: b.iterations,
    mean: parseFloat(b.mean.toFixed(4)),
    median: parseFloat(b.median.toFixed(4)),
    min: parseFloat(b.min.toFixed(4)),
    max: parseFloat(b.max.toFixed(4)),
    p95: parseFloat(b.p95.toFixed(4)),
    p99: parseFloat(b.p99.toFixed(4)),
    stdDev: parseFloat(b.stdDev.toFixed(4))
  })),
  summary: {
    averageMean: parseFloat(avgMean.toFixed(4)),
    averageMedian: parseFloat(avgMedian.toFixed(4)),
    fastest: fastest.name,
    slowest: slowest.name
  }
};

console.log('Results saved to: ./monitoring/benchmark-results.json');
import fs from 'fs/promises';
await fs.writeFile('./monitoring/benchmark-results.json', JSON.stringify(results, null, 2));
