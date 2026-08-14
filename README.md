# Local-AI Hardware Value & Model Fit Suite

An open-source interactive analysis suite, multi-factor scoring engine, and hardware-model fit matrix for local AI and Large Language Model (LLM) inference.

---

## 🌟 Highlights & Features

- **Interactive Modern Web GUI (`dashboard/`)**:
  - Live SVG scatter plot with log-log / linear scaling, interactive mouse-wheel zoom (`0.6×` to `8.0×`), and smooth canvas panning.
  - Dynamically recalculates the **Pareto frontier** in real-time as weights, budget filters, or system toggles change.
  - Adaptive smart annotations: declutters crowded points when zoomed out and expands rich details when zoomed in.
  - Integrated **Device Inspector Drawer** showing full technical specs, memory bus bandwidth, FP16/Tensor TFLOPS, and price provenance.
- **System Context & OS Overhead Modifiers**:
  - **Discrete GPUs**: Adds an adjustable **Host Platform Cost** (default **+$650**) to reflect total build investment (CPU, motherboard, RAM, PSU, chassis).
  - **Unified Memory Systems (Apple Mac Studio, DGX Spark, AMD APUs)**: Factors in that they are complete standalone computers ($0 extra host cost), while deducting an adjustable **OS RAM Overhead** (default **8 GB**, configurable 6–10 GB) reserved by macOS / Linux.
- **Multi-Factor Weighted Scoring Model**:
  - Configurable exponent weights for Memory Capacity ($W_{mem}$), Memory Bandwidth ($W_{bw}$), and Compute FLOPS ($W_{flops}$).
  - Ecosystem Efficiency Multiplier ($E_{cuda}$, e.g. 1.25× for NVIDIA kernel maturity, vLLM, and TensorRT-LLM).
  - One-click presets: *LLM Memory-First*, *Balanced Value*, *High-Throughput*, and *Legacy C × B*.
- **34 Audited Hardware Configurations**:
  - Budget Consumer Cards: RTX 3060 12GB ($280), RTX 4060 Ti 16GB ($449), RTX 4070 Ti Super 16GB ($780), Radeon RX 7900 XTX 24GB ($899).
  - High-End Rigs: Dual RTX 3090 48GB NVLink ($2,400), Quad RTX 3090 96GB Workstation ($5,500), RTX 6000 Ada 48GB ($6,800), Mac Studio M2/M3 Ultra (192GB / 256GB / 512GB).
  - Enterprise Supercomputers: NVIDIA H100 80GB ($31k), GH200 Grace Hopper 576GB ($38k), Dual H100 NVL 188GB ($72k), AMD Instinct MI300X 192GB ($20k), DGX Station H100 320GB ($115k), DGX B200 1.44TB Supercomputer ($280k).
- **Artificial Analysis & Unsloth Model Compatibility Matrix**:
  - 45+ open-weights models (DeepSeek V4/V3/R1, Llama 4/3.3/3.1, Qwen 3.8/2.5/Coder, Gemma 4/3/2, Muse Glimmer/Spark, Mistral, Nemotron, Command A+, Kimi K3, GLM-5.2, Phi-4).
  - **Unsloth Quantization Accuracy Benchmarks**: Calibrated accuracy retention and perplexity impacts for **FP16 (100%)**, **Q8 (99.8%)**, **Q6 (99.3%)**, **Q5 (98.6%)**, **Q4 (97.4%)**, **Q3 (93.0%)**, and **Q2 (87.0%)**.
  - Two-way interactive explorers: *Pick Model &rarr; See Hardware Fit & tok/s Speeds* and *Pick Hardware &rarr; See Supported Models*.

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/johntsams/local-ai-hardware-value.git
cd local-ai-hardware-value

# Create and activate Python virtual environment
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Launch Interactive Dashboard

```bash
python run_dashboard.py
```
*Opens `http://localhost:8000/dashboard/index.html` in your default browser.*

### 3. Generate High-Res Static Charts

```bash
# Standard single devices
python 03_plot_local_ai_value.py --mode singles

# Single devices with System Context active (+Host cost & -OS RAM)
python 03_plot_local_ai_value.py --mode singles --system-context

# Multi-factor custom weighting
python 03_plot_local_ai_value.py --w-mem 1.2 --w-bw 1.0 --w-flops 0.3 --cuda-boost 1.25
```

### 4. Refresh Model Benchmarks from Artificial Analysis

```bash
python scrape_models.py
```

---

## 📊 Value Metric & Mathematical Formulas

### Multi-Factor Weighted Scoring

$$\text{Score} = \left(C_{\text{eff}}^{W_{\text{mem}}}\right) \times \left(B_{\text{eff}}^{W_{\text{bw}}}\right) \times \left(T_{\text{eff}}^{W_{\text{flops}}}\right) \times E_{\text{cuda}}$$

Where:
- $C_{\text{eff}}$ = Usable AI Memory Capacity (GB)
- $B_{\text{eff}}$ = Effective Local Memory Bandwidth (GB/s)
- $T_{\text{eff}}$ = Compute FP16 TFLOPS
- $E_{\text{cuda}}$ = CUDA Software Ecosystem Boost (1.25× default)

### System Context Modifiers

- **Discrete GPUs**: $\text{Price}_{\text{eff}} = \text{Price}_{\text{GPU}} + \text{Cost}_{\text{host}}$ ($+\$650$ default)
- **Unified Systems**: $C_{\text{eff}} = \max(2, C_{\text{raw}} - \text{Overhead}_{\text{OS}})$ ($-8\text{ GB}$ default)

### Memory Fit & Generation Speed Ceilings

$$\text{Memory Required (GB)} = \left(N_{\text{params\_B}} \times \frac{\text{bits}}{8} \times 1.05\right) + \text{KV\_Cache} + \text{Runtime\_Overhead}$$

$$\text{Speed Ceiling (tok/s)} \approx \frac{\text{Local Memory Bandwidth (GB/s)}}{\text{Model Footprint (GB)}}$$

---

## 🎯 Unsloth Quantization Accuracy Retention Reference

| Quantization Tier | Bits / Weight | Unsloth Accuracy Retention | Perplexity Impact ($\Delta\text{PPL}$) | Best Use Case |
| :--- | :---: | :---: | :---: | :--- |
| **FP16 / BF16** | 16.0 | **100.0%** | $+0.00$ | Baseline precision; fine-tuning & reference inference |
| **Q8_0 / FP8** | 8.5 | **99.8%** | $+0.02$ | Near-lossless; imperceptible difference from 16-bit |
| **Q6_K** | 6.6 | **99.3%** | $+0.04$ | High precision for sensitive reasoning & complex code |
| **Q5_K_M** | 5.5 | **98.6%** | $+0.09$ | Recommended sweet spot for compact models ($\le 14\text{B}$) |
| **Q4_K_M / Dynamic 4-bit** | 4.5 | **97.4%** | $+0.18$ | Optimal sweet spot; $<1\%$ accuracy loss on $70\text{B}+$ |
| **Q3_K_M** | 3.4 | **93.0%** | $+0.48$ | Viable for large models ($70\text{B}+$) when VRAM is tight |
| **Q2_K / UD-IQ1** | 2.5 | **87.0%** | $+1.15$ | Extreme memory fitting for $405\text{B}+$ & $671\text{B}$ MoE giants |

---

## 📂 Repository File Structure

```
local-ai-hardware-value/
├── 00_MANIFEST.md                # Package file index
├── 01_TO_AI.md                   # AI agent instructions & core modeling rules
├── 02_TO_HUMAN.md                # Comprehensive human documentation & assumptions
├── 03_plot_local_ai_value.py     # CLI plotting tool with collision-free labeling
├── 04_GRAPHING_LESSONS.md        # Collision avoidance & leader line design lessons
├── 05_PARALLELISM_REFERENCE.md   # Multi-GPU parallelism & interconnect semantics
├── 06_CHARTS/                    # High-resolution generated charts
├── 07_DATA/
│   ├── devices.json              # 34 hardware configurations database
│   ├── devices.csv               # CSV format of hardware database
│   ├── models_artificial_analysis.json  # 45+ open AI models with Unsloth memory specs
│   ├── models_artificial_analysis.csv   # CSV format of model database
│   └── SOURCES.md                # Primary documentation & datasheet citations
├── dashboard/
│   ├── index.html                # Modern 4-tab interactive web interface
│   ├── styles.css                # Curated dark-mode design system & glassmorphism
│   └── app.js                    # Reactive math engine, SVG zoom/pan, fit matrix
├── run_dashboard.py              # Zero-dependency local dashboard launcher
├── scrape_models.py              # Artificial Analysis scraper & Unsloth spec generator
├── requirements.txt              # Core Python dependencies
├── .gitignore                    # Git ignore file
└── README.md                     # Project documentation
```

---

## 📜 License

MIT License. Open source and free for research, commercial, and personal evaluation.
