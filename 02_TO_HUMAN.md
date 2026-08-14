# 02 — TO HUMAN

## Goal

Compare hardware for running AI locally, especially large language models, by combining:

- purchase price & system total cost of ownership (TCO)
- memory capacity & usable AI VRAM (accounting for OS memory overhead)
- local memory bandwidth
- compute throughput (FP16 & Tensor TFLOPS) and software ecosystem efficiency (CUDA)
- ability to combine multiple devices (capacity sharding vs tensor parallelism)
- the type and speed of communication between devices
- **open-source AI model compatibility and estimated token/second performance ceilings** based on Artificial Analysis benchmarks

## Multi-Factor Value Metric

The suite supports both simple legacy heuristics and customizable multi-factor weighted scoring:

### 1. Legacy Heuristic
`Score = Capacity (GB) × Bandwidth (GB/s)`

### 2. Multi-Factor Weighted Scoring
`Score = (C^w_mem) × (B^w_bw) × (T^w_flops) × E_cuda`

where:
- `C` = Usable AI Memory Capacity (GB)
- `B` = Effective Local Memory Bandwidth (GB/s)
- `T` = Compute FP16 TFLOPS
- `E_cuda` = Software ecosystem boost (e.g. 1.25× for NVIDIA CUDA / TensorRT-LLM / vLLM kernel maturity)

## System Context & Host Overhead

- **Discrete GPUs**: Require a host computer (CPU, motherboard, system RAM, PSU, case) costing extra. The suite includes an adjustable **Host Platform Cost** (default **+$650**) to compare total build investment fairly.
- **Unified Memory Systems (Mac Studio, DGX Spark, AMD APUs)**: Are complete standalone computers ($0 extra host cost), but macOS/Linux desktop reserves **6–10 GB** (default **8 GB**) for OS display and system kernels.

## Two-Device Assumptions

### Capacity-Sharded Point
`price = 2P`  
`capacity = 2C`  
`bandwidth term = B`  
`score = (2C) × B`  

Conservative **fit-a-larger-model** view. It does not claim the pair behaves like a single 2B memory bus.

### Tensor-Parallel Theoretical Ceiling
`theoretical aggregate local BW = 2B × η_tp`  
`ceiling score = (2C) × (2B × η_tp)`  

Theoretical hardware resource ceiling when both devices process useful local shards concurrently in parallel.

## Artificial Analysis Open-Source Model Fit

The suite scrapes benchmarks and architecture details for 29 leading open-weights models from Artificial Analysis (DeepSeek V4/V3, Llama 4/3.3/3.1, Qwen3.8/2.5, Mistral, Gemma 4/3, Nemotron 3, Kimi K3, GLM-5.2, Command A+, etc.).

For any hardware device and model, it calculates:
- Exact memory requirements across quantization tiers: **FP16, Q8/FP8, Q5_K_M, Q4_K_M, Q3_K_M**
- Fit status: `FP16 Full`, `Q8 Fast`, `Q5 High`, `Q4 Optimal`, `Q3 Low`, or `Exceeds Memory`
- Estimated token generation speed ceiling: `Speed (tok/s) ≈ Effective Bandwidth (GB/s) / Model Size (GB)`

## Tools & Interactive Suite

### 1. Interactive Web Dashboard (`run_dashboard.py`)
Run:
```bash
python run_dashboard.py
```
Launches an interactive GUI at `http://localhost:8000/dashboard/index.html` featuring:
- Reactive scatter plot with dynamic Pareto frontier recalculation
- System context and OS overhead toggle
- Sliders for Memory, Bandwidth, FLOPS weights, and CUDA boost
- Two-way Hardware-Model Fit Matrix & Token Speed Calculator
- Open Models Explorer & Device Database with search and filters

### 2. Open-Source Model Scraper (`scrape_models.py`)
Run:
```bash
python scrape_models.py
```
Refreshes the Artificial Analysis open-source model database and recalculates quantization memory specs into `07_DATA/models_artificial_analysis.json`.

### 3. CLI Static Plot Generator (`03_plot_local_ai_value.py`)
Usage:
```bash
# Baseline charts
python 03_plot_local_ai_value.py --mode singles
python 03_plot_local_ai_value.py --mode capacity
python 03_plot_local_ai_value.py --mode tp-ceiling

# With System Context (host cost & OS overhead)
python 03_plot_local_ai_value.py --mode singles --system-context

# Multi-Factor Weighted Scoring
python 03_plot_local_ai_value.py --w-mem 1.0 --w-bw 1.0 --w-flops 0.3 --cuda-boost 1.25
```
