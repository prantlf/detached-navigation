# Microbenchmarks

Compare implementations of detaching functions. Either inlined with copied code, or structured with functions sharing the imoplementation.

```
$ make prepare test

detach-window:
  inlined x 27,776,311 ops/sec ±1.66% (93 runs sampled)
  structured x 1,872,514 ops/sec ±0.56% (93 runs sampled)
  fastest is inlined
detach-window:
  inlined x 500,347 ops/sec ±0.86% (90 runs sampled)
  structured x 366,103 ops/sec ±0.85% (87 runs sampled)
  fastest is inlined
```
