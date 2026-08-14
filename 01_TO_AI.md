# 01 — TO AI

## Your job

You are continuing a local-AI hardware comparison project. Treat this folder as the project source of truth unless fresh research supersedes it.

The project is trying to answer:

> **What local-AI hardware gives the most useful model memory and memory-bandwidth capability for the money, including realistic multi-device options, and which open-source models fit on which hardware?**

Do not reduce that question to one number without preserving the distinctions documented here.

## Mandatory working rules

1. **Keep the project files up to date as you work.**
   - When hardware facts change or are corrected, update `07_DATA/devices.csv` and `devices.json`.
   - When open-source models change or new benchmarks appear, run `python scrape_models.py` or update `07_DATA/models_artificial_analysis.json`.
   - When a price is refreshed, update `price_usd`, `price_basis`, `price_as_of`, `price_quality`, and `price_source`.
   - When a parallelism assumption changes, update `05_PARALLELISM_REFERENCE.md` and the affected database rows.
   - When you discover a graphing/layout lesson, append it to `04_GRAPHING_LESSONS.md`.
   - When you materially change the model or project scope, update this file and `02_TO_HUMAN.md`.
   - Regenerate charts with `03_plot_local_ai_value.py` and test the dashboard with `python run_dashboard.py` after data/model changes.

2. **Prefer primary sources for hardware and software claims.**
   - NVIDIA / AMD / Apple / ASUS product documentation.
   - PyTorch, vLLM, MLX, ROCm documentation.
   - Artificial Analysis benchmark datasets.
   - Marketplace/eBay/retailer sources are acceptable for price observations, but explicitly label them as volatile.

3. **Never conflate these three bandwidths:**
   - per-device **local memory bandwidth**
   - theoretical **aggregate local memory bandwidth** when multiple devices are simultaneously active
   - **interconnect bandwidth** between devices

4. **NVLink does not cause local memory bandwidth to double.**
   Two devices physically have two local memory buses. Tensor parallelism can sometimes use both concurrently. NVLink/PCIe/ConnectX/Thunderbolt affects communication between those devices and therefore realized scaling.

5. **Capacity doubling and bandwidth scaling are independent concepts.**
   - 2× model/capacity sharding can make approximately 2C physical memory available to one distributed model.
   - Pipeline/layer sharding does not imply 2B effective local bandwidth for a single stream.
   - Tensor parallelism can approach a theoretical aggregate-local-memory ceiling of 2B for two equal devices, but actual efficiency must be measured.
   - Data parallelism normally replicates the model; it increases throughput but does not give one model 2C memory.

6. **System Context & OS Overhead distinctions:**
   - Discrete GPUs require a host computer (CPU, motherboard, RAM, PSU, case) costing extra (~$650 default TCO).
   - Unified memory systems (Mac Studio, DGX Spark, APUs) are complete standalone computers ($0 extra host cost), but macOS/Linux reserves 6–10GB RAM for display and OS kernel.

7. **Do not treat theoretical `2B` as measured performance.**
   If plotting it, label it **TP theoretical aggregate-local-bandwidth ceiling**.

8. **Modified GPUs are unofficial.**
   The project assumes their memory bus width/speed remains stock unless a specific mod source proves otherwise. More VRAM does not inherently mean more bandwidth.

9. **Unified memory is not the same thing as discrete VRAM.**
   Keep that distinction visible.

## Current charting convention

- circle = single discrete GPU
- diamond = single unified-memory system
- square = 2× capacity-sharded point
- triangle = 2× tensor-parallel theoretical ceiling, only when that mode is deliberately plotted
- orange fill = Pareto-efficient
- blue-gray fill = dominated
- brown line = Pareto frontier

Interconnect type belongs in the label/metadata (`NVLink`, `PCIe`, `ConnectX-7`, `TB5/MLX`, network/RPC); it should **not** determine whether bandwidth is doubled.

## Before giving a purchase recommendation

Refresh the volatile price rows and inspect `price_quality`. Do not make a large purchase recommendation using stale or low-confidence prices without warning the human.
