# Source index

This project deliberately separates **specification sources**, **price sources**, **parallelism sources**, and **AI model benchmark sources**.

## Open-Source AI Model Benchmarks (Artificial Analysis)

- Artificial Analysis LLM Benchmarks & Intelligence Index: https://artificialanalysis.ai/models
- Artificial Analysis LLM Leaderboard & Openness Index: https://artificialanalysis.ai/leaderboards/models
- Extracted dataset & memory requirements: `07_DATA/models_artificial_analysis.json` & `07_DATA/models_artificial_analysis.csv`
- Scraper script: `scrape_models.py`

## Core parallelism / software references

- PyTorch / Torch-TensorRT distributed inference: https://docs.pytorch.org/TensorRT/tutorials/deployment/distributed_inference.html
- vLLM parallelism and scaling: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
- vLLM data parallel deployment: https://docs.vllm.ai/en/latest/serving/data_parallel_deployment/
- MLX distributed communication: https://ml-explore.github.io/mlx/build/html/usage/distributed.html
- MLX tensor parallel example: https://ml-explore.github.io/mlx/build/html/examples/tensor_parallelism.html
- NVIDIA dual-DGX-Spark vLLM/NCCL recipe: https://docs.nvidia.com/nemoclaw/user-guide/deepagents/inference/local-inference/set-up-vllm-on-two-dgx-sparks
- AMD 4-node Ryzen AI Max+ 395 / llama.cpp RPC example: https://www.amd.com/en/developer/resources/technical-articles/2026/how-to-run-a-one-trillion-parameter-llm-locally-an-amd.html

## Key hardware references

- NVIDIA RTX A6000 datasheet: https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/proviz-print-nvidia-rtx-a6000-datasheet-us-nvidia-1454980-r9-web%20%281%29.pdf
- NVIDIA TITAN RTX datasheet: https://www.nvidia.com/content/dam/en-zz/Solutions/titan/documents/titan-rtx-for-creators-us-nvidia-1011126-r6-web.pdf
- Quadro RTX 8000: https://www.nvidia.com/en-au/products/workstations/quadro/rtx-8000/
- RTX 3080: https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/
- RTX 3090: https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/
- RTX 4080 family: https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/
- RTX 4090: https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/
- RTX 5090: https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/
- RTX PRO 6000 Blackwell: https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/
- Apple Mac Studio specs: https://support.apple.com/en-us/122211
- Apple M3 Ultra 512GB announcement: https://www.apple.com/newsroom/2025/03/apple-reveals-m3-ultra-taking-apple-silicon-to-a-new-extreme/
- DGX Spark hardware: https://docs.nvidia.com/dgx/dgx-spark/hardware.html
- DGX Spark clustering: https://docs.nvidia.com/dgx/dgx-spark/spark-clustering.html
- ASUS GX10: https://www.asus.com/us/networking-iot-servers/desktop-ai-supercomputer/ultra-small-ai-supercomputers/asus-ascent-gx10/
- Radeon AI PRO R9700: https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html
- AMD Ryzen AI Halo: https://www.amd.com/en/products/processors/desktops/ryzen/ryzen-ai-halo/ryzen-ai-max-plus-395.html

## Price caveat

Retail/used/modded-card prices are time-sensitive. The CSV contains `price_as_of`, `price_basis`, and `price_quality`. Refresh volatile price rows before making a purchase decision.
