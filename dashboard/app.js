/**
 * Local-AI Hardware Value & Model Fit Dashboard
 * Enhanced with:
 * 1. Vendor Color Theming (Green for NVIDIA, Silver for Apple, Red for AMD, Cyan for ASUS)
 * 2. Intelligence-Throughput (IQ-tok/s) Metric & Evaluator
 * 3. Cost-per-Difficult-Task & Local vs Cloud Break-Even Economics Engine
 * 4. Interactive Zoom/Pan & Adaptive Smart Annotations
 */

// Embedded Fallback Data for offline file:/// protocol loading
const EMBEDDED_DEVICES = [
  {
    "id": "rtx3060_12gb",
    "device_name": "RTX 3060 12GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 280,
    "price_basis": "current retail / active street pricing",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 329,
    "memory_capacity_gb": 12,
    "gpu_addressable_memory_note": "12GB GDDR6 VRAM",
    "local_memory_bandwidth_gbs": 360,
    "memory_type": "GDDR6",
    "fp16_tflops": 13.0,
    "tensor_tflops": 52.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Most affordable 12GB CUDA card for entry-level 7B/8B model inference."
  },
  {
    "id": "rtx4060ti_16gb",
    "device_name": "RTX 4060 Ti 16GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 449,
    "price_basis": "current retail pricing",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 499,
    "memory_capacity_gb": 16,
    "gpu_addressable_memory_note": "16GB GDDR6 VRAM",
    "local_memory_bandwidth_gbs": 288,
    "memory_type": "GDDR6",
    "fp16_tflops": 22.1,
    "tensor_tflops": 177.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x8",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "16GB VRAM at low power (165W), but 128-bit bus limits bandwidth to 288 GB/s."
  },
  {
    "id": "rtx2080ti_22_mod",
    "device_name": "RTX 2080 Ti 22GB mod",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "yes",
    "price_usd": 499,
    "price_basis": "current pre-modded asking price reported from eBay seller",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 22,
    "gpu_addressable_memory_note": "22GB modded VRAM; unofficial configuration",
    "local_memory_bandwidth_gbs": 616,
    "memory_type": "GDDR6",
    "fp16_tflops": 26.9,
    "tensor_tflops": 107.5,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 3.0 x16",
    "nvlink": "yes",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Unofficial memory mod. Preserves stock 352-bit bus width. Turing NVLink supported with bridge."
  },
  {
    "id": "rtx3080_20_mod",
    "device_name": "RTX 3080 20GB mod",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "yes",
    "price_usd": 659,
    "price_basis": "current eBay asking price",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 20,
    "gpu_addressable_memory_note": "20GB modded VRAM; unofficial configuration",
    "local_memory_bandwidth_gbs": 760,
    "memory_type": "GDDR6X",
    "fp16_tflops": 29.8,
    "tensor_tflops": 119.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Unofficial 20GB configuration. No NVLink on RTX 3080."
  },
  {
    "id": "rtx4070ts_16gb",
    "device_name": "RTX 4070 Ti Super 16GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 780,
    "price_basis": "current retail example",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 799,
    "memory_capacity_gb": 16,
    "gpu_addressable_memory_note": "16GB GDDR6X VRAM",
    "local_memory_bandwidth_gbs": 672,
    "memory_type": "GDDR6X",
    "fp16_tflops": 44.1,
    "tensor_tflops": 353.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "256-bit bus with 672 GB/s bandwidth and modern 4th Gen Tensor Cores (FP8 transformer engine)."
  },
  {
    "id": "rx7900xtx_24gb",
    "device_name": "Radeon RX 7900 XTX 24GB",
    "vendor": "AMD",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 899,
    "price_basis": "current retail price",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 999,
    "memory_capacity_gb": 24,
    "gpu_addressable_memory_note": "24GB GDDR6 VRAM",
    "local_memory_bandwidth_gbs": 960,
    "memory_type": "GDDR6",
    "fp16_tflops": 61.4,
    "tensor_tflops": 123.0,
    "cuda_supported": "no",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "possible",
    "caveats": "960 GB/s bandwidth for under $900. High raw memory throughput via ROCm / llama.cpp / Vulkan."
  },
  {
    "id": "titan_rtx",
    "device_name": "TITAN RTX 24GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 900,
    "price_basis": "representative current used eBay asking price",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 2499,
    "memory_capacity_gb": 24,
    "gpu_addressable_memory_note": "24GB VRAM",
    "local_memory_bandwidth_gbs": 672,
    "memory_type": "GDDR6",
    "fp16_tflops": 32.6,
    "tensor_tflops": 130.5,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 3.0 x16",
    "nvlink": "yes",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Official 24GB Turing card. 100 GB/s bidirectional NVLink allows dual 48GB capacity sharding."
  },
  {
    "id": "rtx3090",
    "device_name": "RTX 3090 24GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 1200,
    "price_basis": "representative current used-market estimate",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 1499,
    "memory_capacity_gb": 24,
    "gpu_addressable_memory_note": "24GB VRAM",
    "local_memory_bandwidth_gbs": 936,
    "memory_type": "GDDR6X",
    "fp16_tflops": 35.6,
    "tensor_tflops": 142.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "yes",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "High local bandwidth per dollar among 24GB consumer cards (936 GB/s). Has hardware NVLink bridge support."
  },
  {
    "id": "r9700",
    "device_name": "Radeon AI PRO R9700 32GB",
    "vendor": "AMD",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 1399.99,
    "price_basis": "current Micro Center retail example",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 1299,
    "memory_capacity_gb": 32,
    "gpu_addressable_memory_note": "32GB dedicated VRAM",
    "local_memory_bandwidth_gbs": 640,
    "memory_type": "GDDR6",
    "fp16_tflops": 58.0,
    "tensor_tflops": 116.0,
    "cuda_supported": "no",
    "standalone_system": "no",
    "pcie": "PCIe 5.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "possible",
    "caveats": "AMD workstation card with 32GB VRAM and PCIe 5.0. ROCm software stack dependent."
  },
  {
    "id": "mac_mini_m4pro_64",
    "device_name": "Mac Mini M4 Pro 64GB",
    "vendor": "Apple",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 2199,
    "price_basis": "Apple direct M4 Pro 64GB configuration",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 2199,
    "memory_capacity_gb": 64,
    "gpu_addressable_memory_note": "64GB unified memory",
    "local_memory_bandwidth_gbs": 273,
    "memory_type": "unified LPDDR5X",
    "fp16_tflops": 28.0,
    "tensor_tflops": 45.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated SoC",
    "nvlink": "no",
    "thunderbolt5": "yes",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "High capacity per dollar for Apple Silicon ($2,199 for 64GB unified RAM). Includes CPU & mobo."
  },
  {
    "id": "rtx8000",
    "device_name": "Quadro RTX 8000 48GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 2219,
    "price_basis": "current active used asking price",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 10000,
    "memory_capacity_gb": 48,
    "gpu_addressable_memory_note": "48GB VRAM",
    "local_memory_bandwidth_gbs": 672,
    "memory_type": "GDDR6",
    "fp16_tflops": 32.6,
    "tensor_tflops": 130.5,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 3.0 x16",
    "nvlink": "yes",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Enterprise card providing 48GB native VRAM and NVLink support for under $2,300."
  },
  {
    "id": "rtx4080_32_mod",
    "device_name": "RTX 4080 32GB mod",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "yes",
    "price_usd": 2350,
    "price_basis": "recent observed modified-card asking price",
    "price_quality": "low",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 32,
    "gpu_addressable_memory_note": "32GB modded VRAM; unofficial configuration",
    "local_memory_bandwidth_gbs": 716.8,
    "memory_type": "GDDR6X",
    "fp16_tflops": 48.7,
    "tensor_tflops": 390.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Unofficial 32GB memory modification. Low-current price row; verify seller and cooling."
  },
  {
    "id": "dual_rtx3090_48",
    "device_name": "Dual RTX 3090 48GB (NVLink Rig)",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 2400,
    "price_basis": "2x used RTX 3090 ($1200 ea) + NVLink bridge",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 2998,
    "memory_capacity_gb": 48,
    "gpu_addressable_memory_note": "48GB aggregate across 2 GPUs with 112.5 GB/s NVLink bridge",
    "local_memory_bandwidth_gbs": 936,
    "memory_type": "GDDR6X",
    "fp16_tflops": 71.2,
    "tensor_tflops": 284.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16 dual",
    "nvlink": "yes",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Workhorse dual-GPU workstation rig. Holds 70B models at Q4/Q5 with excellent token generation speeds."
  },
  {
    "id": "m4max36",
    "device_name": "Mac Studio M4 Max 36GB",
    "vendor": "Apple",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 2499,
    "price_basis": "Apple direct 36GB/512GB configuration",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 2499,
    "memory_capacity_gb": 36,
    "gpu_addressable_memory_note": "36GB unified memory shared by CPU/GPU",
    "local_memory_bandwidth_gbs": 410,
    "memory_type": "unified LPDDR",
    "fp16_tflops": 40.0,
    "tensor_tflops": 65.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated SoC",
    "nvlink": "no",
    "thunderbolt5": "yes",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Complete standalone computer ($0 extra host cost). Unified memory shares 36GB across macOS, display & GPU."
  },
  {
    "id": "rtx4080s_32_mod",
    "device_name": "RTX 4080 Super 32GB mod",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "yes",
    "price_usd": 2550,
    "price_basis": "current eBay asking price for 32GB modified card",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 32,
    "gpu_addressable_memory_note": "32GB modded VRAM",
    "local_memory_bandwidth_gbs": 736,
    "memory_type": "GDDR6X",
    "fp16_tflops": 52.2,
    "tensor_tflops": 418.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Unofficial 32GB Ada Lovelace mod card. 736 GB/s bandwidth with powerful FP8 Tensor Core compute."
  },
  {
    "id": "rtx5090",
    "device_name": "RTX 5090 32GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 3700,
    "price_basis": "current representative market listing",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 1999,
    "memory_capacity_gb": 32,
    "gpu_addressable_memory_note": "32GB GDDR7 VRAM",
    "local_memory_bandwidth_gbs": 1792,
    "memory_type": "GDDR7",
    "fp16_tflops": 105.0,
    "tensor_tflops": 1680.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 5.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Blackwell consumer flagship with 1,792 GB/s GDDR7 memory and 512-bit bus. No NVLink."
  },
  {
    "id": "a6000",
    "device_name": "RTX A6000 48GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 3999,
    "price_basis": "current representative used asking price",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 4650,
    "memory_capacity_gb": 48,
    "gpu_addressable_memory_note": "48GB VRAM",
    "local_memory_bandwidth_gbs": 768,
    "memory_type": "GDDR6 ECC",
    "fp16_tflops": 38.7,
    "tensor_tflops": 154.8,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "yes",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Workstation Ampere flagship with 48GB ECC VRAM, 768 GB/s bandwidth, and 112.5 GB/s NVLink bridge capability."
  },
  {
    "id": "gx10",
    "device_name": "ASUS Ascent GX10 128GB",
    "vendor": "ASUS",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 3999,
    "price_basis": "ASUS US official support price",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 128,
    "gpu_addressable_memory_note": "128GB coherent unified system memory",
    "local_memory_bandwidth_gbs": 273,
    "memory_type": "LPDDR5X unified",
    "fp16_tflops": 140.0,
    "tensor_tflops": 280.0,
    "cuda_supported": "yes",
    "standalone_system": "yes",
    "pcie": "GB10 integrated platform",
    "nvlink": "NVLink-C2C",
    "thunderbolt5": "no",
    "connectx7": "yes",
    "capacity_sharding": "yes",
    "tensor_parallel": "possible",
    "caveats": "GB10 integrated personal supercomputer with 128GB unified memory, NVLink-C2C and ConnectX-7 clustering."
  },
  {
    "id": "amd_halo_128",
    "device_name": "AMD Ryzen AI Max+ 395 Halo 128GB",
    "vendor": "AMD",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 3999,
    "price_basis": "AMD Halo developer platform retail price",
    "price_quality": "high",
    "price_as_of": "2026-05",
    "msrp_usd": "",
    "memory_capacity_gb": 128,
    "gpu_addressable_memory_note": "128GB unified memory",
    "local_memory_bandwidth_gbs": 256,
    "memory_type": "LPDDR5X unified",
    "fp16_tflops": 60.0,
    "tensor_tflops": 90.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated APU",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "possible",
    "caveats": "AMD APU workstation with 128GB unified LPDDR5X. Multi-node llama.cpp RPC demonstrated."
  },
  {
    "id": "rtx4090_48_mod",
    "device_name": "RTX 4090 48GB mod",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "yes",
    "price_usd": 4500,
    "price_basis": "recent completed eBay auction for 48GB modified card",
    "price_quality": "medium",
    "price_as_of": "2026-06",
    "msrp_usd": "",
    "memory_capacity_gb": 48,
    "gpu_addressable_memory_note": "48GB modded VRAM",
    "local_memory_bandwidth_gbs": 1008,
    "memory_type": "GDDR6X",
    "fp16_tflops": 82.6,
    "tensor_tflops": 660.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Unofficial custom 48GB mod on full AD102 core. 1,008 GB/s bandwidth and massive compute throughput."
  },
  {
    "id": "dgx_spark",
    "device_name": "NVIDIA DGX Spark 128GB",
    "vendor": "NVIDIA",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 4699,
    "price_basis": "NVIDIA marketplace direct",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 128,
    "gpu_addressable_memory_note": "128GB unified system memory",
    "local_memory_bandwidth_gbs": 273,
    "memory_type": "LPDDR5X unified",
    "fp16_tflops": 140.0,
    "tensor_tflops": 280.0,
    "cuda_supported": "yes",
    "standalone_system": "yes",
    "pcie": "GB10 platform",
    "nvlink": "NVLink-C2C",
    "thunderbolt5": "no",
    "connectx7": "yes",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Official NVIDIA personal AI workstation with 128GB unified system memory, ConnectX-7 RDMA and Blackwell architecture."
  },
  {
    "id": "m3ultra96",
    "device_name": "Mac Studio M3 Ultra 96GB",
    "vendor": "Apple",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 5299,
    "price_basis": "Apple direct 28C CPU / 60C GPU / 96GB",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 5299,
    "memory_capacity_gb": 96,
    "gpu_addressable_memory_note": "96GB unified memory",
    "local_memory_bandwidth_gbs": 819,
    "memory_type": "unified LPDDR",
    "fp16_tflops": 65.0,
    "tensor_tflops": 105.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated SoC",
    "nvlink": "no",
    "thunderbolt5": "yes",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "96GB unified memory with 819 GB/s bandwidth. Full standalone system with TB5 RDMA clustering."
  },
  {
    "id": "quad_rtx3090_96",
    "device_name": "Quad RTX 3090 96GB Workstation",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 5500,
    "price_basis": "4x RTX 3090 + multi-GPU mining/workstation motherboard & 1600W PSU",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 6500,
    "memory_capacity_gb": 96,
    "gpu_addressable_memory_note": "96GB aggregate VRAM across 4 GPUs",
    "local_memory_bandwidth_gbs": 936,
    "memory_type": "GDDR6X",
    "fp16_tflops": 142.4,
    "tensor_tflops": 568.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x8/x8/x8/x8",
    "nvlink": "yes (2 pairs)",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Popular DIY 96GB high-throughput rig. Runs 70B unquantized at FP16 or 120B/405B at Q4."
  },
  {
    "id": "m2ultra192",
    "device_name": "Mac Studio M2 Ultra 192GB",
    "vendor": "Apple",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 6599,
    "price_basis": "Apple refurbished/retail 192GB M2 Ultra",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 6999,
    "memory_capacity_gb": 192,
    "gpu_addressable_memory_note": "192GB unified memory",
    "local_memory_bandwidth_gbs": 800,
    "memory_type": "unified LPDDR5",
    "fp16_tflops": 56.0,
    "tensor_tflops": 90.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated SoC",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "192GB unified memory allows running 70B at FP16 or DeepSeek 671B / Llama 405B at Q2.5-Q3 with zero discrete GPU cluster complexity."
  },
  {
    "id": "rtx6000_ada_48",
    "device_name": "RTX 6000 Ada Generation 48GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 6800,
    "price_basis": "current authorized retailer pricing",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 6800,
    "memory_capacity_gb": 48,
    "gpu_addressable_memory_note": "48GB GDDR6 ECC VRAM",
    "local_memory_bandwidth_gbs": 960,
    "memory_type": "GDDR6 ECC",
    "fp16_tflops": 91.1,
    "tensor_tflops": 728.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 4.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Ada Lovelace workstation flagship. 48GB ECC VRAM, 960 GB/s bandwidth, 300W TDP blower card for dense workstations."
  },
  {
    "id": "m3ultra256_refurb",
    "device_name": "Mac Studio M3 Ultra 256GB",
    "vendor": "Apple",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 8319,
    "price_basis": "historical Apple Certified Refurbished observation",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": "",
    "memory_capacity_gb": 256,
    "gpu_addressable_memory_note": "256GB unified memory",
    "local_memory_bandwidth_gbs": 819,
    "memory_type": "unified LPDDR",
    "fp16_tflops": 65.0,
    "tensor_tflops": 105.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated SoC",
    "nvlink": "no",
    "thunderbolt5": "yes",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Massive 256GB unified RAM capable of running 70B models at FP16 or 405B at Q4 in a compact desktop."
  },
  {
    "id": "rtxpro6000_bw",
    "device_name": "RTX PRO 6000 Blackwell 96GB",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 16000,
    "price_basis": "NVIDIA marketplace direct",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 16000,
    "memory_capacity_gb": 96,
    "gpu_addressable_memory_note": "96GB ECC VRAM",
    "local_memory_bandwidth_gbs": 1792,
    "memory_type": "GDDR7 ECC",
    "fp16_tflops": 125.0,
    "tensor_tflops": 1850.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 5.0 x16",
    "nvlink": "no",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Enterprise Blackwell Workstation Edition with 96GB GDDR7 ECC VRAM and 1,792 GB/s local memory bandwidth."
  },
  {
    "id": "m3ultra512_refurb",
    "device_name": "Mac Studio M3 Ultra 512GB",
    "vendor": "Apple",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 17589,
    "price_basis": "historical Apple Certified Refurbished reference",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 18999,
    "memory_capacity_gb": 512,
    "gpu_addressable_memory_note": "512GB unified memory",
    "local_memory_bandwidth_gbs": 819,
    "memory_type": "unified LPDDR",
    "fp16_tflops": 65.0,
    "tensor_tflops": 105.0,
    "cuda_supported": "no",
    "standalone_system": "yes",
    "pcie": "integrated SoC",
    "nvlink": "no",
    "thunderbolt5": "yes",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Single-desktop memory titan. 512GB unified memory runs DeepSeek R1 671B or Llama 405B locally."
  },
  {
    "id": "amd_mi300x_192",
    "device_name": "AMD Instinct MI300X 192GB",
    "vendor": "AMD",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 19999,
    "price_basis": "OEM / Cloud accelerator purchase estimate",
    "price_quality": "medium",
    "price_as_of": "2026-08",
    "msrp_usd": 20000,
    "memory_capacity_gb": 192,
    "gpu_addressable_memory_note": "192GB HBM3 VRAM",
    "local_memory_bandwidth_gbs": 5300,
    "memory_type": "HBM3",
    "fp16_tflops": 653.0,
    "tensor_tflops": 1300.0,
    "cuda_supported": "no",
    "standalone_system": "no",
    "pcie": "OAM / PCIe 5.0",
    "nvlink": "Infinity Fabric (896 GB/s)",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Unbelievable 5,300 GB/s HBM3 memory bandwidth and 192GB VRAM on a single accelerator. ROCm enterprise stack."
  },
  {
    "id": "nvidia_h100_pcie_80",
    "device_name": "NVIDIA H100 80GB PCIe",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 31000,
    "price_basis": "current authorized distributor pricing",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 30000,
    "memory_capacity_gb": 80,
    "gpu_addressable_memory_note": "80GB HBM3 VRAM",
    "local_memory_bandwidth_gbs": 2000,
    "memory_type": "HBM3",
    "fp16_tflops": 375.0,
    "tensor_tflops": 750.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 5.0 x16",
    "nvlink": "yes (600 GB/s bridge)",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Hopper datacenter powerhouse. 2,000 GB/s HBM3 bandwidth, FP8 Transformer Engine, and 600 GB/s NVLink."
  },
  {
    "id": "nvidia_gh200_480",
    "device_name": "NVIDIA GH200 Grace Hopper Superchip",
    "vendor": "NVIDIA",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 38000,
    "price_basis": "OEM workstation server node reference",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 40000,
    "memory_capacity_gb": 576,
    "gpu_addressable_memory_note": "96GB HBM3 + 480GB LPDDR5X coherent memory",
    "local_memory_bandwidth_gbs": 4000,
    "memory_type": "HBM3 + LPDDR5X NVLink-C2C",
    "fp16_tflops": 495.0,
    "tensor_tflops": 990.0,
    "cuda_supported": "yes",
    "standalone_system": "yes",
    "pcie": "Integrated Grace Hopper",
    "nvlink": "yes (900 GB/s NVLink-C2C)",
    "thunderbolt5": "no",
    "connectx7": "yes",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Combines 72-core Grace CPU with Hopper GPU via 900 GB/s bidirectional NVLink-C2C. Holds massive models natively."
  },
  {
    "id": "nvidia_h100_nvl_pair_188",
    "device_name": "Dual NVIDIA H100 NVL 188GB (NVLink Pair)",
    "vendor": "NVIDIA",
    "category": "discrete GPU",
    "modified": "no",
    "price_usd": 72000,
    "price_basis": "2x H100 NVL 94GB PCIe + 3-slot NVLink bridge",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 75000,
    "memory_capacity_gb": 188,
    "gpu_addressable_memory_note": "188GB aggregate HBM3 across 2 GPUs with 600 GB/s NVLink bridge",
    "local_memory_bandwidth_gbs": 3900,
    "memory_type": "HBM3",
    "fp16_tflops": 835.0,
    "tensor_tflops": 1670.0,
    "cuda_supported": "yes",
    "standalone_system": "no",
    "pcie": "PCIe 5.0 x16 dual",
    "nvlink": "yes (600 GB/s NVLink)",
    "thunderbolt5": "no",
    "connectx7": "no",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "Purpose-built dual-GPU LLM inference solution. 3,900 GB/s bandwidth per GPU and 188GB total memory."
  },
  {
    "id": "nvidia_dgx_station_h100",
    "device_name": "NVIDIA DGX Station H100 320GB Supercomputer",
    "vendor": "NVIDIA",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 115000,
    "price_basis": "OEM / NVIDIA authorized enterprise workstation price",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 125000,
    "memory_capacity_gb": 320,
    "gpu_addressable_memory_note": "4x H100 80GB SXM5 + NVSwitch fully interconnected",
    "local_memory_bandwidth_gbs": 3350,
    "memory_type": "HBM3 SXM5",
    "fp16_tflops": 1500.0,
    "tensor_tflops": 3000.0,
    "cuda_supported": "yes",
    "standalone_system": "yes",
    "pcie": "Integrated SXM5",
    "nvlink": "yes (900 GB/s NVSwitch)",
    "thunderbolt5": "no",
    "connectx7": "yes",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "The $100k+ enterprise workstation beast. 4x H100 SXM5 with 900 GB/s all-to-all NVSwitch. Runs frontier models at blazing speeds."
  },
  {
    "id": "nvidia_dgx_b200_beast",
    "device_name": "NVIDIA DGX B200 1.44TB Supercomputer",
    "vendor": "NVIDIA",
    "category": "unified-memory system",
    "modified": "no",
    "price_usd": 280000,
    "price_basis": "NVIDIA Enterprise direct DGX B200 system estimate",
    "price_quality": "high",
    "price_as_of": "2026-08",
    "msrp_usd": 300000,
    "memory_capacity_gb": 1440,
    "gpu_addressable_memory_note": "8x B200 180GB HBM3e + 1,800 GB/s NVLink 5 NVSwitch",
    "local_memory_bandwidth_gbs": 8000,
    "memory_type": "HBM3e",
    "fp16_tflops": 7200.0,
    "tensor_tflops": 14400.0,
    "cuda_supported": "yes",
    "standalone_system": "yes",
    "pcie": "Integrated B200 NVLink 5",
    "nvlink": "yes (1,800 GB/s NVLink 5)",
    "thunderbolt5": "no",
    "connectx7": "yes",
    "capacity_sharding": "yes",
    "tensor_parallel": "yes",
    "caveats": "The ultimate AI supercomputer. 8x Blackwell B200 GPUs with 1.44TB aggregate HBM3e and 1,800 GB/s NVLink 5 fabric."
  }
];

const EMBEDDED_MODELS = [
  {
    "id": "qwen_3_8_27b_instruct",
    "name": "Qwen 3.8 27B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2026-02-15",
    "total_params_b": 27.5,
    "active_params_b": 27.5,
    "context_window_str": "128k",
    "intelligence_index": 54.2,
    "aa_mmlu_pro": 76.8,
    "aa_gpqa": 58.4,
    "aa_math_500": 88.2,
    "aa_coding_humaneval": 89.6,
    "output_speed_tok_s": 55,
    "description": "High-demand next-gen 27.5B dense model delivering exceptional reasoning, coding, and mathematical fluency in a 24GB-32GB GPU footprint.",
    "memory_req_gb": {
      "fp16": 61.3,
      "q8_0": 34.3,
      "q6_k": 27.6,
      "q5_k_m": 23.6,
      "q4_k_m": 20.2,
      "q3_k_m": 16.2,
      "q2_k": 13.1
    }
  },
  {
    "id": "qwen_3_8_coder_27b",
    "name": "Qwen 3.8 Coder 27B",
    "creator": "Alibaba Qwen",
    "category": "Dense Code Specialist",
    "release_date": "2026-02-18",
    "total_params_b": 27.5,
    "active_params_b": 27.5,
    "context_window_str": "128k",
    "intelligence_index": 55.0,
    "aa_mmlu_pro": 77.2,
    "aa_gpqa": 57.8,
    "aa_math_500": 89.4,
    "aa_coding_humaneval": 93.4,
    "output_speed_tok_s": 55,
    "description": "Premier open coding model optimized for multi-file repository generation, bug repair, and SWE-bench tasks.",
    "memory_req_gb": {
      "fp16": 61.3,
      "q8_0": 34.3,
      "q6_k": 27.6,
      "q5_k_m": 23.6,
      "q4_k_m": 20.2,
      "q3_k_m": 16.2,
      "q2_k": 13.1
    }
  },
  {
    "id": "qwen_3_8_math_27b",
    "name": "Qwen 3.8 Math 27B",
    "creator": "Alibaba Qwen",
    "category": "Dense Math Specialist",
    "release_date": "2026-02-19",
    "total_params_b": 27.5,
    "active_params_b": 27.5,
    "context_window_str": "64k",
    "intelligence_index": 56.4,
    "aa_mmlu_pro": 78.5,
    "aa_gpqa": 62.1,
    "aa_math_500": 92.5,
    "aa_coding_humaneval": 84.2,
    "output_speed_tok_s": 55,
    "description": "Specialized mathematical powerhouse outperforming 70B models on AIME 2024 and Olympiad competitions.",
    "memory_req_gb": {
      "fp16": 61.3,
      "q8_0": 34.3,
      "q6_k": 27.6,
      "q5_k_m": 23.6,
      "q4_k_m": 20.2,
      "q3_k_m": 16.2,
      "q2_k": 13.1
    }
  },
  {
    "id": "qwen_3_8_32b_instruct",
    "name": "Qwen 3.8 32B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2026-02-20",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_str": "128k",
    "intelligence_index": 55.6,
    "aa_mmlu_pro": 78.9,
    "aa_gpqa": 60.5,
    "aa_math_500": 90.1,
    "aa_coding_humaneval": 90.8,
    "output_speed_tok_s": 48,
    "description": "Flagship 32B dense model providing an optimal balance of throughput and high-tier reasoning on 24GB-48GB VRAM.",
    "memory_req_gb": {
      "fp16": 71.8,
      "q8_0": 39.9,
      "q6_k": 32.0,
      "q5_k_m": 27.3,
      "q4_k_m": 23.2,
      "q3_k_m": 18.5,
      "q2_k": 14.8
    }
  },
  {
    "id": "qwen_3_8_72b_instruct",
    "name": "Qwen 3.8 72B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2026-02-22",
    "total_params_b": 72.7,
    "active_params_b": 72.7,
    "context_window_str": "128k",
    "intelligence_index": 57.1,
    "aa_mmlu_pro": 81.2,
    "aa_gpqa": 64.0,
    "aa_math_500": 92.8,
    "aa_coding_humaneval": 92.4,
    "output_speed_tok_s": 24,
    "description": "Frontier 72B dense open-weights model challenging proprietary cloud APIs across all reasoning and academic benchmarks.",
    "memory_req_gb": {
      "fp16": 159.0,
      "q8_0": 87.4,
      "q6_k": 69.9,
      "q5_k_m": 59.3,
      "q4_k_m": 50.1,
      "q3_k_m": 39.7,
      "q2_k": 31.3
    }
  },
  {
    "id": "qwen_3_8_max",
    "name": "Qwen 3.8 Max (2.4T MoE)",
    "creator": "Alibaba Qwen",
    "category": "Frontier MoE",
    "release_date": "2026-02-25",
    "total_params_b": 2400.0,
    "active_params_b": 95.0,
    "context_window_str": "256k",
    "intelligence_index": 58.0,
    "aa_mmlu_pro": 83.4,
    "aa_gpqa": 66.8,
    "aa_math_500": 94.6,
    "aa_coding_humaneval": 94.0,
    "output_speed_tok_s": 18,
    "description": "Next-generation 2.4T parameter MoE activating 95B per token. SOTA open general intelligence for large clusters.",
    "memory_req_gb": {
      "fp16": 5052.8,
      "q8_0": 2690.3,
      "q6_k": 2111.6,
      "q5_k_m": 1761.8,
      "q4_k_m": 1457.3,
      "q3_k_m": 1114.4,
      "q2_k": 837.8
    }
  },
  {
    "id": "qwq_32b_preview",
    "name": "QwQ 32B Preview (Reasoning)",
    "creator": "Alibaba Qwen",
    "category": "Dense Reasoning",
    "release_date": "2024-11-28",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_str": "32k",
    "intelligence_index": 52.4,
    "aa_mmlu_pro": 74.5,
    "aa_gpqa": 56.1,
    "aa_math_500": 86.4,
    "aa_coding_humaneval": 86.0,
    "output_speed_tok_s": 46,
    "description": "State-of-the-art open reasoning model using Chain-of-Thought; rivals OpenAI o1-preview on MATH 500 and GPQA Diamond.",
    "memory_req_gb": {
      "fp16": 71.8,
      "q8_0": 39.9,
      "q6_k": 32.0,
      "q5_k_m": 27.3,
      "q4_k_m": 23.2,
      "q3_k_m": 18.5,
      "q2_k": 14.8
    }
  },
  {
    "id": "qwen_2_5_coder_32b",
    "name": "Qwen 2.5 Coder 32B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense Code Specialist",
    "release_date": "2024-11-12",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_str": "128k",
    "intelligence_index": 49.8,
    "aa_mmlu_pro": 70.8,
    "aa_gpqa": 51.4,
    "aa_math_500": 83.2,
    "aa_coding_humaneval": 92.7,
    "output_speed_tok_s": 48,
    "description": "Gold standard open-source coding model. Matches GPT-4o in Python and SWE-bench code generation.",
    "memory_req_gb": {
      "fp16": 71.8,
      "q8_0": 39.9,
      "q6_k": 32.0,
      "q5_k_m": 27.3,
      "q4_k_m": 23.2,
      "q3_k_m": 18.5,
      "q2_k": 14.8
    }
  },
  {
    "id": "qwen_2_5_72b_instruct",
    "name": "Qwen 2.5 72B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2024-09-19",
    "total_params_b": 72.7,
    "active_params_b": 72.7,
    "context_window_str": "128k",
    "intelligence_index": 48.9,
    "aa_mmlu_pro": 69.5,
    "aa_gpqa": 49.8,
    "aa_math_500": 83.1,
    "aa_coding_humaneval": 86.4,
    "output_speed_tok_s": 24,
    "description": "Frontier open dense model with exceptional multilingual, coding, and mathematical reasoning.",
    "memory_req_gb": {
      "fp16": 159.0,
      "q8_0": 87.4,
      "q6_k": 69.9,
      "q5_k_m": 59.3,
      "q4_k_m": 50.1,
      "q3_k_m": 39.7,
      "q2_k": 31.3
    }
  },
  {
    "id": "qwen_2_5_32b_instruct",
    "name": "Qwen 2.5 32B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2024-09-19",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_str": "128k",
    "intelligence_index": 44.3,
    "aa_mmlu_pro": 63.8,
    "aa_gpqa": 44.2,
    "aa_math_500": 78.4,
    "aa_coding_humaneval": 82.3,
    "output_speed_tok_s": 48,
    "description": "Sweet-spot model for 24GB\u201348GB local hardware setups. High speed with top-tier reasoning.",
    "memory_req_gb": {
      "fp16": 71.8,
      "q8_0": 39.9,
      "q6_k": 32.0,
      "q5_k_m": 27.3,
      "q4_k_m": 23.2,
      "q3_k_m": 18.5,
      "q2_k": 14.8
    }
  },
  {
    "id": "qwen_2_5_14b_instruct",
    "name": "Qwen 2.5 14B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2024-09-19",
    "total_params_b": 14.7,
    "active_params_b": 14.7,
    "context_window_str": "128k",
    "intelligence_index": 40.5,
    "aa_mmlu_pro": 58.6,
    "aa_gpqa": 39.5,
    "aa_math_500": 73.2,
    "aa_coding_humaneval": 77.8,
    "output_speed_tok_s": 78,
    "description": "High-efficiency 14B model that runs comfortably on 12GB\u201316GB VRAM consumer GPUs.",
    "memory_req_gb": {
      "fp16": 34.5,
      "q8_0": 20.0,
      "q6_k": 16.5,
      "q5_k_m": 14.3,
      "q4_k_m": 12.4,
      "q3_k_m": 10.3,
      "q2_k": 8.7
    }
  },
  {
    "id": "qwen_2_5_coder_14b",
    "name": "Qwen 2.5 Coder 14B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense Code Specialist",
    "release_date": "2024-11-12",
    "total_params_b": 14.7,
    "active_params_b": 14.7,
    "context_window_str": "128k",
    "intelligence_index": 43.1,
    "aa_mmlu_pro": 62.4,
    "aa_gpqa": 42.0,
    "aa_math_500": 76.5,
    "aa_coding_humaneval": 84.5,
    "output_speed_tok_s": 78,
    "description": "Exceptional coding performance in a compact 14B footprint for single 16GB GPUs.",
    "memory_req_gb": {
      "fp16": 34.5,
      "q8_0": 20.0,
      "q6_k": 16.5,
      "q5_k_m": 14.3,
      "q4_k_m": 12.4,
      "q3_k_m": 10.3,
      "q2_k": 8.7
    }
  },
  {
    "id": "qwen_2_5_coder_7b",
    "name": "Qwen 2.5 Coder 7B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense Code Specialist",
    "release_date": "2024-11-12",
    "total_params_b": 7.6,
    "active_params_b": 7.6,
    "context_window_str": "128k",
    "intelligence_index": 38.6,
    "aa_mmlu_pro": 54.2,
    "aa_gpqa": 36.4,
    "aa_math_500": 71.0,
    "aa_coding_humaneval": 79.2,
    "output_speed_tok_s": 125,
    "description": "Ultra-fast local coding assistant; runs at >100 tok/s on 8GB\u201312GB VRAM cards.",
    "memory_req_gb": {
      "fp16": 18.0,
      "q8_0": 10.5,
      "q6_k": 8.6,
      "q5_k_m": 7.5,
      "q4_k_m": 6.6,
      "q3_k_m": 5.5,
      "q2_k": 4.6
    }
  },
  {
    "id": "qwen_2_5_7b_instruct",
    "name": "Qwen 2.5 7B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense General",
    "release_date": "2024-09-19",
    "total_params_b": 7.6,
    "active_params_b": 7.6,
    "context_window_str": "128k",
    "intelligence_index": 36.8,
    "aa_mmlu_pro": 51.5,
    "aa_gpqa": 34.2,
    "aa_math_500": 68.4,
    "aa_coding_humaneval": 72.1,
    "output_speed_tok_s": 125,
    "description": "Lightweight general model for edge devices, budget GPUs, and high-concurrency serving.",
    "memory_req_gb": {
      "fp16": 18.0,
      "q8_0": 10.5,
      "q6_k": 8.6,
      "q5_k_m": 7.5,
      "q4_k_m": 6.6,
      "q3_k_m": 5.5,
      "q2_k": 4.6
    }
  },
  {
    "id": "qwen_2_5_math_72b",
    "name": "Qwen 2.5 Math 72B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Dense Math Specialist",
    "release_date": "2024-09-19",
    "total_params_b": 72.7,
    "active_params_b": 72.7,
    "context_window_str": "32k",
    "intelligence_index": 51.5,
    "aa_mmlu_pro": 73.8,
    "aa_gpqa": 55.4,
    "aa_math_500": 87.2,
    "aa_coding_humaneval": 81.0,
    "output_speed_tok_s": 24,
    "description": "SOTA specialized mathematics reasoning model scoring 85%+ on MATH-500.",
    "memory_req_gb": {
      "fp16": 159.0,
      "q8_0": 87.4,
      "q6_k": 69.9,
      "q5_k_m": 59.3,
      "q4_k_m": 50.1,
      "q3_k_m": 39.7,
      "q2_k": 31.3
    }
  },
  {
    "id": "qwen_2_5_vl_72b",
    "name": "Qwen 2.5 VL 72B Instruct",
    "creator": "Alibaba Qwen",
    "category": "Vision-Language Multimodal",
    "release_date": "2025-01-27",
    "total_params_b": 72.7,
    "active_params_b": 72.7,
    "context_window_str": "128k",
    "intelligence_index": 49.5,
    "aa_mmlu_pro": 70.2,
    "aa_gpqa": 51.0,
    "aa_math_500": 82.5,
    "aa_coding_humaneval": 85.0,
    "output_speed_tok_s": 22,
    "description": "Frontier vision-language model with document understanding, visual coding, and diagram reasoning.",
    "memory_req_gb": {
      "fp16": 159.0,
      "q8_0": 87.4,
      "q6_k": 69.9,
      "q5_k_m": 59.3,
      "q4_k_m": 50.1,
      "q3_k_m": 39.7,
      "q2_k": 31.3
    }
  },
  {
    "id": "deepseek_r1_671b",
    "name": "DeepSeek R1 (671B MoE)",
    "creator": "DeepSeek AI",
    "category": "Frontier MoE Reasoning",
    "release_date": "2025-01-20",
    "total_params_b": 671.0,
    "active_params_b": 37.0,
    "context_window_str": "128k",
    "intelligence_index": 50.8,
    "aa_mmlu_pro": 72.8,
    "aa_gpqa": 54.2,
    "aa_math_500": 85.8,
    "aa_coding_humaneval": 87.5,
    "output_speed_tok_s": 14,
    "description": "Full open-weights reasoning model trained via large-scale reinforcement learning; matches OpenAI o1.",
    "memory_req_gb": {
      "fp16": 1421.9,
      "q8_0": 761.4,
      "q6_k": 599.6,
      "q5_k_m": 501.8,
      "q4_k_m": 416.7,
      "q3_k_m": 320.8,
      "q2_k": 243.5
    }
  },
  {
    "id": "deepseek_v3_671b",
    "name": "DeepSeek V3 (671B MoE)",
    "creator": "DeepSeek AI",
    "category": "Frontier MoE",
    "release_date": "2024-12-26",
    "total_params_b": 671.0,
    "active_params_b": 37.0,
    "context_window_str": "128k",
    "intelligence_index": 48.6,
    "aa_mmlu_pro": 69.1,
    "aa_gpqa": 49.2,
    "aa_math_500": 81.6,
    "aa_coding_humaneval": 86.2,
    "output_speed_tok_s": 16,
    "description": "Frontier 671B MoE with Multi-head Latent Attention (MLA) and DeepSeekMoE architecture.",
    "memory_req_gb": {
      "fp16": 1421.9,
      "q8_0": 761.4,
      "q6_k": 599.6,
      "q5_k_m": 501.8,
      "q4_k_m": 416.7,
      "q3_k_m": 320.8,
      "q2_k": 243.5
    }
  },
  {
    "id": "deepseek_v4_pro",
    "name": "DeepSeek V4 Pro (1.6T MoE)",
    "creator": "DeepSeek AI",
    "category": "Next-Gen MoE",
    "release_date": "2026-03-01",
    "total_params_b": 1600.0,
    "active_params_b": 64.0,
    "context_window_str": "1M",
    "intelligence_index": 53.2,
    "aa_mmlu_pro": 75.6,
    "aa_gpqa": 57.0,
    "aa_math_500": 88.0,
    "aa_coding_humaneval": 90.5,
    "output_speed_tok_s": 15,
    "description": "Next-generation 1.6T MoE model with native 1M context window and ultra-dense expert routing.",
    "memory_req_gb": {
      "fp16": 3372.8,
      "q8_0": 1797.8,
      "q6_k": 1412.0,
      "q5_k_m": 1178.8,
      "q4_k_m": 975.8,
      "q3_k_m": 747.2,
      "q2_k": 562.8
    }
  },
  {
    "id": "deepseek_r1_distill_qwen_32b",
    "name": "DeepSeek R1 Distill Qwen 32B",
    "creator": "DeepSeek AI",
    "category": "Dense Reasoning Distill",
    "release_date": "2025-01-20",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_str": "128k",
    "intelligence_index": 47.8,
    "aa_mmlu_pro": 68.2,
    "aa_gpqa": 48.6,
    "aa_math_500": 82.4,
    "aa_coding_humaneval": 85.1,
    "output_speed_tok_s": 48,
    "description": "DeepSeek R1 reasoning knowledge distilled into Qwen 2.5 32B base. SOTA for 24GB\u201348GB VRAM.",
    "memory_req_gb": {
      "fp16": 71.8,
      "q8_0": 39.9,
      "q6_k": 32.0,
      "q5_k_m": 27.3,
      "q4_k_m": 23.2,
      "q3_k_m": 18.5,
      "q2_k": 14.8
    }
  },
  {
    "id": "deepseek_r1_distill_llama_70b",
    "name": "DeepSeek R1 Distill Llama 70B",
    "creator": "DeepSeek AI",
    "category": "Dense Reasoning Distill",
    "release_date": "2025-01-20",
    "total_params_b": 70.6,
    "active_params_b": 70.6,
    "context_window_str": "128k",
    "intelligence_index": 49.2,
    "aa_mmlu_pro": 70.4,
    "aa_gpqa": 50.8,
    "aa_math_500": 84.6,
    "aa_coding_humaneval": 86.8,
    "output_speed_tok_s": 24,
    "description": "R1 reasoning knowledge distilled into Llama 3.3 70B. Superb mathematical proofs and code.",
    "memory_req_gb": {
      "fp16": 154.6,
      "q8_0": 85.1,
      "q6_k": 68.0,
      "q5_k_m": 57.7,
      "q4_k_m": 48.8,
      "q3_k_m": 38.7,
      "q2_k": 30.6
    }
  },
  {
    "id": "deepseek_r1_distill_qwen_14b",
    "name": "DeepSeek R1 Distill Qwen 14B",
    "creator": "DeepSeek AI",
    "category": "Dense Reasoning Distill",
    "release_date": "2025-01-20",
    "total_params_b": 14.7,
    "active_params_b": 14.7,
    "context_window_str": "128k",
    "intelligence_index": 42.8,
    "aa_mmlu_pro": 61.5,
    "aa_gpqa": 41.5,
    "aa_math_500": 75.8,
    "aa_coding_humaneval": 80.2,
    "output_speed_tok_s": 78,
    "description": "Reasoning distilled into 14B. Fits in 16GB GPUs while outperforming previous 70B bases.",
    "memory_req_gb": {
      "fp16": 34.5,
      "q8_0": 20.0,
      "q6_k": 16.5,
      "q5_k_m": 14.3,
      "q4_k_m": 12.4,
      "q3_k_m": 10.3,
      "q2_k": 8.7
    }
  },
  {
    "id": "deepseek_r1_distill_qwen_7b",
    "name": "DeepSeek R1 Distill Qwen 7B",
    "creator": "DeepSeek AI",
    "category": "Dense Reasoning Distill",
    "release_date": "2025-01-20",
    "total_params_b": 7.6,
    "active_params_b": 7.6,
    "context_window_str": "128k",
    "intelligence_index": 38.5,
    "aa_mmlu_pro": 54.0,
    "aa_gpqa": 36.2,
    "aa_math_500": 70.5,
    "aa_coding_humaneval": 76.4,
    "output_speed_tok_s": 125,
    "description": "7B reasoning model capable of solving complex algorithmic puzzles locally on budget GPUs.",
    "memory_req_gb": {
      "fp16": 18.0,
      "q8_0": 10.5,
      "q6_k": 8.6,
      "q5_k_m": 7.5,
      "q4_k_m": 6.6,
      "q3_k_m": 5.5,
      "q2_k": 4.6
    }
  },
  {
    "id": "llama_4_scout_109b",
    "name": "Llama 4 Scout (109B MoE)",
    "creator": "Meta AI",
    "category": "MoE Long-Context",
    "release_date": "2026-01-15",
    "total_params_b": 109.0,
    "active_params_b": 17.0,
    "context_window_str": "10M",
    "intelligence_index": 54.5,
    "aa_mmlu_pro": 77.4,
    "aa_gpqa": 59.2,
    "aa_math_500": 89.0,
    "aa_coding_humaneval": 91.2,
    "output_speed_tok_s": 38,
    "description": "Next-gen MoE architecture with unprecedented 10M token context window and native multimodal reasoning.",
    "memory_req_gb": {
      "fp16": 235.2,
      "q8_0": 127.9,
      "q6_k": 101.6,
      "q5_k_m": 85.7,
      "q4_k_m": 71.9,
      "q3_k_m": 56.3,
      "q2_k": 43.8
    }
  },
  {
    "id": "llama_3_3_70b_instruct",
    "name": "Llama 3.3 70B Instruct",
    "creator": "Meta AI",
    "category": "Dense General",
    "release_date": "2024-12-06",
    "total_params_b": 70.6,
    "active_params_b": 70.6,
    "context_window_str": "128k",
    "intelligence_index": 48.4,
    "aa_mmlu_pro": 68.9,
    "aa_gpqa": 49.0,
    "aa_math_500": 81.2,
    "aa_coding_humaneval": 85.7,
    "output_speed_tok_s": 24,
    "description": "Upgraded 70B powerhouse delivering Llama 3.1 405B level capabilities in a 70B parameter size.",
    "memory_req_gb": {
      "fp16": 154.6,
      "q8_0": 85.1,
      "q6_k": 68.0,
      "q5_k_m": 57.7,
      "q4_k_m": 48.8,
      "q3_k_m": 38.7,
      "q2_k": 30.6
    }
  },
  {
    "id": "llama_3_1_405b_instruct",
    "name": "Llama 3.1 405B Instruct",
    "creator": "Meta AI",
    "category": "Frontier Dense",
    "release_date": "2024-07-23",
    "total_params_b": 405.0,
    "active_params_b": 405.0,
    "context_window_str": "128k",
    "intelligence_index": 52.1,
    "aa_mmlu_pro": 74.0,
    "aa_gpqa": 55.8,
    "aa_math_500": 86.0,
    "aa_coding_humaneval": 89.0,
    "output_speed_tok_s": 4,
    "description": "Meta's flagship 405B open dense model for high-rigor synthetic data generation and distillation.",
    "memory_req_gb": {
      "fp16": 863.3,
      "q8_0": 464.6,
      "q6_k": 367.0,
      "q5_k_m": 307.9,
      "q4_k_m": 256.6,
      "q3_k_m": 198.7,
      "q2_k": 152.0
    }
  },
  {
    "id": "llama_3_1_8b_instruct",
    "name": "Llama 3.1 8B Instruct",
    "creator": "Meta AI",
    "category": "Dense General",
    "release_date": "2024-07-23",
    "total_params_b": 8.0,
    "active_params_b": 8.0,
    "context_window_str": "128k",
    "intelligence_index": 35.2,
    "aa_mmlu_pro": 49.5,
    "aa_gpqa": 32.8,
    "aa_math_500": 65.4,
    "aa_coding_humaneval": 70.0,
    "output_speed_tok_s": 120,
    "description": "The industry standard 8B model for local agents, tool use, and high-speed inference.",
    "memory_req_gb": {
      "fp16": 18.8,
      "q8_0": 10.9,
      "q6_k": 9.0,
      "q5_k_m": 7.8,
      "q4_k_m": 6.8,
      "q3_k_m": 5.7,
      "q2_k": 4.8
    }
  },
  {
    "id": "llama_3_2_11b_vision",
    "name": "Llama 3.2 11B Vision",
    "creator": "Meta AI",
    "category": "Vision-Language Multimodal",
    "release_date": "2024-09-25",
    "total_params_b": 11.0,
    "active_params_b": 11.0,
    "context_window_str": "128k",
    "intelligence_index": 37.5,
    "aa_mmlu_pro": 52.8,
    "aa_gpqa": 35.0,
    "aa_math_500": 67.8,
    "aa_coding_humaneval": 73.5,
    "output_speed_tok_s": 95,
    "description": "Multimodal visual reasoning model for image understanding, chart comprehension, and captioning.",
    "memory_req_gb": {
      "fp16": 25.1,
      "q8_0": 14.3,
      "q6_k": 11.6,
      "q5_k_m": 10.0,
      "q4_k_m": 8.6,
      "q3_k_m": 7.0,
      "q2_k": 5.8
    }
  },
  {
    "id": "gemma_4_31b_it",
    "name": "Gemma 4 31B Instruct",
    "creator": "Google DeepMind",
    "category": "Dense General",
    "release_date": "2026-02-10",
    "total_params_b": 31.0,
    "active_params_b": 31.0,
    "context_window_str": "256k",
    "intelligence_index": 48.0,
    "aa_mmlu_pro": 68.4,
    "aa_gpqa": 48.5,
    "aa_math_500": 80.5,
    "aa_coding_humaneval": 84.8,
    "output_speed_tok_s": 50,
    "description": "Next-gen DeepMind open-weights model built with cutting-edge architectural advances from Gemini.",
    "memory_req_gb": {
      "fp16": 68.7,
      "q8_0": 38.2,
      "q6_k": 30.7,
      "q5_k_m": 26.2,
      "q4_k_m": 22.3,
      "q3_k_m": 17.8,
      "q2_k": 14.3
    }
  },
  {
    "id": "gemma_3_27b_it",
    "name": "Gemma 3 27B Instruct",
    "creator": "Google DeepMind",
    "category": "Dense General",
    "release_date": "2025-02-28",
    "total_params_b": 27.2,
    "active_params_b": 27.2,
    "context_window_str": "128k",
    "intelligence_index": 43.0,
    "aa_mmlu_pro": 62.0,
    "aa_gpqa": 42.5,
    "aa_math_500": 76.2,
    "aa_coding_humaneval": 80.0,
    "output_speed_tok_s": 56,
    "description": "High-efficiency 27B model trained on extensive multilingual and synthetic datasets.",
    "memory_req_gb": {
      "fp16": 60.7,
      "q8_0": 33.9,
      "q6_k": 27.4,
      "q5_k_m": 23.4,
      "q4_k_m": 20.0,
      "q3_k_m": 16.1,
      "q2_k": 13.0
    }
  },
  {
    "id": "gemma_3_12b_it",
    "name": "Gemma 3 12B Instruct",
    "creator": "Google DeepMind",
    "category": "Dense General",
    "release_date": "2025-02-28",
    "total_params_b": 12.0,
    "active_params_b": 12.0,
    "context_window_str": "128k",
    "intelligence_index": 39.2,
    "aa_mmlu_pro": 55.4,
    "aa_gpqa": 37.8,
    "aa_math_500": 71.5,
    "aa_coding_humaneval": 75.2,
    "output_speed_tok_s": 90,
    "description": "Ideal balance of memory compactness and reasoning capabilities for 16GB consumer cards.",
    "memory_req_gb": {
      "fp16": 27.2,
      "q8_0": 15.4,
      "q6_k": 12.5,
      "q5_k_m": 10.7,
      "q4_k_m": 9.2,
      "q3_k_m": 7.5,
      "q2_k": 6.1
    }
  },
  {
    "id": "gemma_2_27b_it",
    "name": "Gemma 2 27B Instruct",
    "creator": "Google DeepMind",
    "category": "Dense General",
    "release_date": "2024-06-27",
    "total_params_b": 27.2,
    "active_params_b": 27.2,
    "context_window_str": "8k",
    "intelligence_index": 41.5,
    "aa_mmlu_pro": 59.8,
    "aa_gpqa": 40.2,
    "aa_math_500": 74.0,
    "aa_coding_humaneval": 78.4,
    "output_speed_tok_s": 56,
    "description": "Trained with knowledge distillation from Gemini models; punches well above its parameter weight.",
    "memory_req_gb": {
      "fp16": 60.7,
      "q8_0": 33.9,
      "q6_k": 27.4,
      "q5_k_m": 23.4,
      "q4_k_m": 20.0,
      "q3_k_m": 16.1,
      "q2_k": 13.0
    }
  },
  {
    "id": "gemma_2_9b_it",
    "name": "Gemma 2 9B Instruct",
    "creator": "Google DeepMind",
    "category": "Dense General",
    "release_date": "2024-06-27",
    "total_params_b": 9.2,
    "active_params_b": 9.2,
    "context_window_str": "8k",
    "intelligence_index": 36.0,
    "aa_mmlu_pro": 50.4,
    "aa_gpqa": 33.5,
    "aa_math_500": 66.8,
    "aa_coding_humaneval": 71.0,
    "output_speed_tok_s": 110,
    "description": "Proven 9B architecture with sliding-window attention and logit capping.",
    "memory_req_gb": {
      "fp16": 21.3,
      "q8_0": 12.3,
      "q6_k": 10.0,
      "q5_k_m": 8.7,
      "q4_k_m": 7.5,
      "q3_k_m": 6.2,
      "q2_k": 5.2
    }
  },
  {
    "id": "mistral_large_2",
    "name": "Mistral Large 2 (123B)",
    "creator": "Mistral AI",
    "category": "Dense General",
    "release_date": "2024-07-24",
    "total_params_b": 123.0,
    "active_params_b": 123.0,
    "context_window_str": "128k",
    "intelligence_index": 48.2,
    "aa_mmlu_pro": 68.6,
    "aa_gpqa": 48.7,
    "aa_math_500": 80.8,
    "aa_coding_humaneval": 86.0,
    "output_speed_tok_s": 16,
    "description": "Frontier 123B model with exceptional reasoning, 80+ coding languages, and multilingual fluency.",
    "memory_req_gb": {
      "fp16": 264.6,
      "q8_0": 143.5,
      "q6_k": 113.9,
      "q5_k_m": 95.9,
      "q4_k_m": 80.3,
      "q3_k_m": 62.8,
      "q2_k": 48.6
    }
  },
  {
    "id": "codestral_24b",
    "name": "Codestral 24B Instruct",
    "creator": "Mistral AI",
    "category": "Dense Code Specialist",
    "release_date": "2024-05-29",
    "total_params_b": 24.0,
    "active_params_b": 24.0,
    "context_window_str": "32k",
    "intelligence_index": 45.0,
    "aa_mmlu_pro": 64.5,
    "aa_gpqa": 45.0,
    "aa_math_500": 78.6,
    "aa_coding_humaneval": 88.4,
    "output_speed_tok_s": 62,
    "description": "Specialized coding model trained on 80+ programming languages with fill-in-the-middle support.",
    "memory_req_gb": {
      "fp16": 54.0,
      "q8_0": 30.4,
      "q6_k": 24.6,
      "q5_k_m": 21.1,
      "q4_k_m": 18.0,
      "q3_k_m": 14.6,
      "q2_k": 11.9
    }
  },
  {
    "id": "pixtral_large_123b",
    "name": "Pixtral Large 123B",
    "creator": "Mistral AI",
    "category": "Vision-Language Multimodal",
    "release_date": "2024-11-18",
    "total_params_b": 123.0,
    "active_params_b": 123.0,
    "context_window_str": "128k",
    "intelligence_index": 48.0,
    "aa_mmlu_pro": 68.2,
    "aa_gpqa": 48.4,
    "aa_math_500": 80.5,
    "aa_coding_humaneval": 85.5,
    "output_speed_tok_s": 15,
    "description": "Frontier multimodal vision-language model with native chart, document, and image reasoning.",
    "memory_req_gb": {
      "fp16": 264.6,
      "q8_0": 143.5,
      "q6_k": 113.9,
      "q5_k_m": 95.9,
      "q4_k_m": 80.3,
      "q3_k_m": 62.8,
      "q2_k": 48.6
    }
  },
  {
    "id": "mixtral_8x22b_instruct",
    "name": "Mixtral 8x22B Instruct",
    "creator": "Mistral AI",
    "category": "Sparse MoE",
    "release_date": "2024-04-10",
    "total_params_b": 141.0,
    "active_params_b": 39.0,
    "context_window_str": "64k",
    "intelligence_index": 46.8,
    "aa_mmlu_pro": 66.8,
    "aa_gpqa": 46.9,
    "aa_math_500": 79.2,
    "aa_coding_humaneval": 84.0,
    "output_speed_tok_s": 22,
    "description": "141B total parameter sparse MoE activating 39B per token. High throughput and math competency.",
    "memory_req_gb": {
      "fp16": 302.4,
      "q8_0": 163.6,
      "q6_k": 129.6,
      "q5_k_m": 109.1,
      "q4_k_m": 91.2,
      "q3_k_m": 71.0,
      "q2_k": 54.8
    }
  },
  {
    "id": "mistral_nemo_12b",
    "name": "Mistral NeMo 12B",
    "creator": "Mistral & NVIDIA",
    "category": "Dense General",
    "release_date": "2024-07-18",
    "total_params_b": 12.2,
    "active_params_b": 12.2,
    "context_window_str": "128k",
    "intelligence_index": 38.8,
    "aa_mmlu_pro": 55.0,
    "aa_gpqa": 37.4,
    "aa_math_500": 70.8,
    "aa_coding_humaneval": 74.8,
    "output_speed_tok_s": 88,
    "description": "Jointly trained by Mistral and NVIDIA; uses Tekken tokenizer for high multilingual token efficiency.",
    "memory_req_gb": {
      "fp16": 27.6,
      "q8_0": 15.6,
      "q6_k": 12.7,
      "q5_k_m": 10.9,
      "q4_k_m": 9.3,
      "q3_k_m": 7.6,
      "q2_k": 6.2
    }
  },
  {
    "id": "nemotron_3_ultra_550b",
    "name": "Nemotron 3 Ultra (550B MoE)",
    "creator": "NVIDIA",
    "category": "Enterprise MoE",
    "release_date": "2025-10-05",
    "total_params_b": 550.0,
    "active_params_b": 42.0,
    "context_window_str": "256k",
    "intelligence_index": 52.8,
    "aa_mmlu_pro": 75.0,
    "aa_gpqa": 56.4,
    "aa_math_500": 87.5,
    "aa_coding_humaneval": 89.8,
    "output_speed_tok_s": 18,
    "description": "NVIDIA flagship enterprise model optimized for TensorRT-LLM and vLLM inference engines.",
    "memory_req_gb": {
      "fp16": 1167.8,
      "q8_0": 626.4,
      "q6_k": 493.8,
      "q5_k_m": 413.6,
      "q4_k_m": 343.8,
      "q3_k_m": 265.3,
      "q2_k": 201.9
    }
  },
  {
    "id": "command_a_plus_218b",
    "name": "Command A+ (218B MoE)",
    "creator": "Cohere",
    "category": "Enterprise Agent MoE",
    "release_date": "2025-03-14",
    "total_params_b": 218.0,
    "active_params_b": 32.0,
    "context_window_str": "256k",
    "intelligence_index": 50.4,
    "aa_mmlu_pro": 71.8,
    "aa_gpqa": 53.0,
    "aa_math_500": 84.0,
    "aa_coding_humaneval": 87.2,
    "output_speed_tok_s": 20,
    "description": "Cohere frontier open-weights model specialized in enterprise tool use, multi-step agents, and RAG.",
    "memory_req_gb": {
      "fp16": 470.6,
      "q8_0": 256.0,
      "q6_k": 203.4,
      "q5_k_m": 171.7,
      "q4_k_m": 144.0,
      "q3_k_m": 112.9,
      "q2_k": 87.7
    }
  },
  {
    "id": "kimi_k3_2_8t",
    "name": "Kimi K3 (2.8T MoE)",
    "creator": "Moonshot AI",
    "category": "Frontier Ultra-MoE",
    "release_date": "2026-01-25",
    "total_params_b": 2800.0,
    "active_params_b": 110.0,
    "context_window_str": "2M",
    "intelligence_index": 59.7,
    "aa_mmlu_pro": 85.6,
    "aa_gpqa": 69.2,
    "aa_math_500": 96.0,
    "aa_coding_humaneval": 95.5,
    "output_speed_tok_s": 14,
    "description": "Massive 2.8T MoE model with native 2M context window and state-of-the-art long-document comprehension.",
    "memory_req_gb": {
      "fp16": 5892.8,
      "q8_0": 3136.6,
      "q6_k": 2461.4,
      "q5_k_m": 2053.3,
      "q4_k_m": 1698.0,
      "q3_k_m": 1298.0,
      "q2_k": 975.3
    }
  },
  {
    "id": "glm_5_2_753b",
    "name": "GLM-5.2 (753B MoE)",
    "creator": "Zhipu AI",
    "category": "Frontier MoE",
    "release_date": "2025-12-18",
    "total_params_b": 753.0,
    "active_params_b": 48.0,
    "context_window_str": "1M",
    "intelligence_index": 52.0,
    "aa_mmlu_pro": 73.8,
    "aa_gpqa": 55.6,
    "aa_math_500": 86.4,
    "aa_coding_humaneval": 88.5,
    "output_speed_tok_s": 16,
    "description": "Open frontier MoE with 1M context window and leading multilingual agent orchestration.",
    "memory_req_gb": {
      "fp16": 1594.1,
      "q8_0": 852.9,
      "q6_k": 671.3,
      "q5_k_m": 561.5,
      "q4_k_m": 466.0,
      "q3_k_m": 358.4,
      "q2_k": 271.6
    }
  },
  {
    "id": "phi_4_14b",
    "name": "Phi-4 14B",
    "creator": "Microsoft",
    "category": "Dense Synthetic Specialist",
    "release_date": "2024-12-12",
    "total_params_b": 14.0,
    "active_params_b": 14.0,
    "context_window_str": "16k",
    "intelligence_index": 44.0,
    "aa_mmlu_pro": 63.5,
    "aa_gpqa": 43.8,
    "aa_math_500": 78.0,
    "aa_coding_humaneval": 83.2,
    "output_speed_tok_s": 80,
    "description": "Microsoft dense model trained with synthetic curriculum data; beats 70B models on math benchmarks.",
    "memory_req_gb": {
      "fp16": 31.4,
      "q8_0": 17.6,
      "q6_k": 14.2,
      "q5_k_m": 12.2,
      "q4_k_m": 10.4,
      "q3_k_m": 8.4,
      "q2_k": 6.8
    }
  },
  {
    "id": "hermes_3_70b",
    "name": "Hermes 3 70B Instruct",
    "creator": "Nous Research",
    "category": "Dense Agent Specialist",
    "release_date": "2024-08-15",
    "total_params_b": 70.6,
    "active_params_b": 70.6,
    "context_window_str": "128k",
    "intelligence_index": 47.5,
    "aa_mmlu_pro": 67.5,
    "aa_gpqa": 48.0,
    "aa_math_500": 80.0,
    "aa_coding_humaneval": 85.0,
    "output_speed_tok_s": 24,
    "description": "Premier open-source uncensored agentic model with advanced structured output and function calling.",
    "memory_req_gb": {
      "fp16": 154.6,
      "q8_0": 85.1,
      "q6_k": 68.0,
      "q5_k_m": 57.7,
      "q4_k_m": 48.8,
      "q3_k_m": 38.7,
      "q2_k": 30.6
    }
  }
];

const state = {
  rawDevices: [],
  rawModels: [],
  filteredDevices: [],
  processedPoints: [],
  selectedDeviceId: null,
  selectedPointId: null,
  
  // Y-Axis Metric Mode
  yMetric: 'weighted-score', // 'weighted-score' | 'iq-throughput' | 'iq-per-dollar' | 'cost-per-1k-tasks'
  
  // Display & Parallelism Settings
  chartMode: 'singles', // 'singles' | 'capacity' | 'tp-ceiling'
  
  // Optional Real-World Adjustment Settings (off by default)
  useSystemContext: false,
  hostCostUsd: 650,
  macOsOverheadGb: 8,
  
  // Multi-Factor Weighted Scoring Settings
  weightMem: 1.0,
  weightBw: 1.0,
  weightFlops: 0.3,
  cudaBoost: 1.25,
  tpEfficiency: 0.85,
  
  // IQ-Throughput Settings (User requested: weight towards intelligence)
  weightIq: 1.3,
  weightSpeed: 0.7,
  
  // Task Economics Settings
  cloudApiBaseline: 'gpt-4o', // 'claude-3-5-sonnet' | 'gpt-4o' | 'deepseek-r1-api' | 'llama-3-3-70b-cloud'
  dailyTokens: 2000000,
  
  // Chart Settings & Zoom/Pan State
  isLogScale: true,
  includeModded: true,
  includeDatacenter: true,
  allowedVendors: new Set(['NVIDIA', 'Apple', 'AMD', 'ASUS']),
  plotPriceFilter: 'all', // 'all' | 'under1k' | '1k-3k' | '3k-10k' | '10k-50k' | 'datacenter'
  
  // Zoom & Pan
  zoomScale: 1.0,
  panX: 0,
  panY: 0,
  isPlotFullscreen: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  labelMode: 'auto',
  
  // Model Fit Matrix Settings
  matrixContextTokens: 8192,
  modelClassFilter: 'all',
  quantAccuracyFilter: 'all',
  matrixDateFilter: 'all',
  matrixMinIQ: 0,
  matrixMaxPrice: 'all',
  selectedExplorerModelId: null,
  selectedExplorerHardwareId: null,

  // Open Models Explorer Filters & Sort
  modelSearchQuery: '',
  modelDateFilter: 'all',
  modelMinIQ: 0,
  modelSizeFilter: 'all',
  modelLabFilter: 'all',
  modelSort: 'intelligence_desc',

  // Device Database Filters
  deviceSearchQuery: '',
  deviceVendorFilter: 'all',
  devicePriceFilter: 'all',
  deviceVramFilter: 'all'
};

// Vendor Signature Theme Colors (Marathon / GITS Tactical HUD)
const VENDOR_COLORS = {
  'NVIDIA': { fill: '#00ff66', stroke: '#00b848', glow: 'rgba(0, 255, 102, 0.5)', name: 'NVIDIA (Phosphor Green)' },
  'Apple':  { fill: '#f0f6fc', stroke: '#7e93ab', glow: 'rgba(240, 246, 252, 0.4)', name: 'Apple Silicon (Titanium)' },
  'AMD':    { fill: '#ff2a55', stroke: '#c41338', glow: 'rgba(255, 42, 85, 0.5)', name: 'AMD (Laser Crimson)' },
  'ASUS':   { fill: '#00f0ff', stroke: '#00a8cc', glow: 'rgba(0, 240, 255, 0.5)', name: 'ASUS / Other (Cyber Cyan)' }
};

// Cloud API Pricing Baselines ($ per 1M tokens)
const CLOUD_API_PRICING = {
  'claude-3-5-sonnet':    { name: 'Claude 3.5 Sonnet', costPer1MTok: 9.00, costPer1kTasks: 13.50 },
  'gpt-4o':               { name: 'GPT-4o',           costPer1MTok: 6.25, costPer1kTasks: 9.38 },
  'deepseek-r1-api':      { name: 'DeepSeek R1 API',  costPer1MTok: 1.37, costPer1kTasks: 2.05 },
  'llama-3-3-70b-cloud':  { name: 'Llama 3.3 70B (Cloud)', costPer1MTok: 0.80, costPer1kTasks: 1.20 }
};

// Preset Multi-Factor Weight Configurations
const PRESETS = {
  'memory-heavy': { wMem: 1.0, wBw: 1.0, wFlops: 0.3, cuda: 1.25, name: 'LLM Memory-First' },
  'balanced':     { wMem: 0.8, wBw: 0.8, wFlops: 0.6, cuda: 1.20, name: 'Balanced Value' },
  'throughput':   { wMem: 0.5, wBw: 1.2, wFlops: 1.0, cuda: 1.30, name: 'High-Throughput' },
  'legacy':       { wMem: 1.0, wBw: 1.0, wFlops: 0.0, cuda: 1.00, name: 'Legacy C × B' }
};

// ================= INITIALIZATION & DATA FETCHING =================
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initControlListeners();
  initZoomPanListeners();
  await loadData();
  recalculateAndRender();
});

async function loadData() {
  try {
    const devRes = await fetch('../07_DATA/devices.json');
    if (devRes.ok) {
      state.rawDevices = await devRes.json();
    } else {
      const apiDev = await fetch('/api/devices');
      if (apiDev.ok) state.rawDevices = await apiDev.json();
      else state.rawDevices = EMBEDDED_DEVICES;
    }
  } catch (e) {
    state.rawDevices = EMBEDDED_DEVICES;
  }

  try {
    const modRes = await fetch('../07_DATA/models_artificial_analysis.json');
    if (modRes.ok) {
      state.rawModels = await modRes.json();
    } else {
      const apiMod = await fetch('/api/models');
      if (apiMod.ok) state.rawModels = await apiMod.json();
      else state.rawModels = EMBEDDED_MODELS;
    }
  } catch (e) {
    state.rawModels = EMBEDDED_MODELS;
  }
}

// ================= TAB NAVIGATION =================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      if (btn.dataset.tab === 'hardware-plot') {
        renderScatterPlot();
      } else if (btn.dataset.tab === 'model-fit-matrix') {
        renderFitMatrix();
      } else if (btn.dataset.tab === 'open-models') {
        renderOpenModelsExplorer();
      } else if (btn.dataset.tab === 'task-economics') {
        renderTaskEconomics();
      } else if (btn.dataset.tab === 'device-table') {
        renderDeviceTable();
      }
    });
  });
}

// ================= CONTROL LISTENERS =================
function initControlListeners() {
  // Y-Axis Metric Selector
  const selY = document.getElementById('selYMetric');
  if (selY) {
    selY.addEventListener('change', (e) => {
      state.yMetric = e.target.value;
      const stdWeights = document.getElementById('standardWeightControls');
      const iqWeights = document.getElementById('iqWeightControls');
      const weightsTitle = document.getElementById('lblWeightsPanelTitle');
      
      if (state.yMetric === 'iq-throughput' || state.yMetric === 'iq-per-dollar') {
        if (stdWeights) stdWeights.style.display = 'none';
        if (iqWeights) iqWeights.style.display = 'block';
        if (weightsTitle) weightsTitle.textContent = 'IQ-Throughput Weights';
      } else {
        if (stdWeights) stdWeights.style.display = 'block';
        if (iqWeights) iqWeights.style.display = 'none';
        if (weightsTitle) weightsTitle.textContent = 'Value Scoring Weights';
      }
      
      updatePlotTitles();
      recalculateAndRender();
    });
  }

  document.querySelectorAll('input[name="chartMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.chartMode = e.target.value;
      recalculateAndRender();
    });
  });

  const toggleSys = document.getElementById('toggleSystemContext');
  if (toggleSys) {
    const syncSystemContextControls = () => {
      const sysCtrl = document.getElementById('systemContextControls');
      if (sysCtrl) {
        sysCtrl.style.opacity = state.useSystemContext ? '1.0' : '0.4';
        sysCtrl.style.pointerEvents = state.useSystemContext ? 'auto' : 'none';
      }
    };

    toggleSys.addEventListener('change', (e) => {
      state.useSystemContext = e.target.checked;
      syncSystemContextControls();
      updateFootnote();
      recalculateAndRender();
    });
    syncSystemContextControls();
    updateFootnote();
  }

  // System Context Sliders
  bindSlider('sliderHostCost', 'lblHostCost', (v) => {
    state.hostCostUsd = parseFloat(v);
    return `$${v}`;
  });
  bindSlider('sliderOsOverhead', 'lblOsOverhead', (v) => {
    state.macOsOverheadGb = parseFloat(v);
    return `${v} GB`;
  });

  // Multi-Factor Sliders
  bindSlider('sliderWeightMem', 'lblWeightMem', (v) => {
    state.weightMem = parseFloat(v);
    document.getElementById('fMem').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}x`;
  });
  bindSlider('sliderWeightBw', 'lblWeightBw', (v) => {
    state.weightBw = parseFloat(v);
    document.getElementById('fBw').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}x`;
  });
  bindSlider('sliderWeightFlops', 'lblWeightFlops', (v) => {
    state.weightFlops = parseFloat(v);
    document.getElementById('fFlops').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}x`;
  });
  bindSlider('sliderCudaBoost', 'lblCudaBoost', (v) => {
    state.cudaBoost = parseFloat(v);
    document.getElementById('fCuda').textContent = `${parseFloat(v).toFixed(2)}x CUDA`;
    return `${parseFloat(v).toFixed(2)}x`;
  });

  // IQ-Throughput Sliders
  bindSlider('sliderWeightIq', 'lblWeightIq', (v) => {
    state.weightIq = parseFloat(v);
    document.getElementById('fIq').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}x`;
  });
  bindSlider('sliderWeightSpeed', 'lblWeightSpeed', (v) => {
    state.weightSpeed = parseFloat(v);
    document.getElementById('fSpeed').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}x`;
  });

  // Preset Buttons
  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = PRESETS[btn.dataset.preset];
      if (p) {
        setSliderVal('sliderWeightMem', 'lblWeightMem', p.wMem, `${p.wMem.toFixed(1)}x`);
        setSliderVal('sliderWeightBw', 'lblWeightBw', p.wBw, `${p.wBw.toFixed(1)}x`);
        setSliderVal('sliderWeightFlops', 'lblWeightFlops', p.wFlops, `${p.wFlops.toFixed(1)}x`);
        setSliderVal('sliderCudaBoost', 'lblCudaBoost', p.cuda, `${p.cuda.toFixed(2)}x`);
        state.weightMem = p.wMem;
        state.weightBw = p.wBw;
        state.weightFlops = p.wFlops;
        state.cudaBoost = p.cuda;
        document.getElementById('fMem').textContent = p.wMem.toFixed(1);
        document.getElementById('fBw').textContent = p.wBw.toFixed(1);
        document.getElementById('fFlops').textContent = p.wFlops.toFixed(1);
        document.getElementById('fCuda').textContent = `${p.cuda.toFixed(2)}x CUDA`;
        recalculateAndRender();
      }
    });
  });

  // Vendor Filter Chips
  document.querySelectorAll('.vendor-filter').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.allowedVendors.add(cb.value);
      else state.allowedVendors.delete(cb.value);
      recalculateAndRender();
    });
  });

  const chkMod = document.getElementById('chkIncludeModded');
  if (chkMod) {
    chkMod.addEventListener('change', (e) => {
      state.includeModded = e.target.checked;
      recalculateAndRender();
    });
  }

  const chkDc = document.getElementById('chkIncludeDatacenter');
  if (chkDc) {
    chkDc.addEventListener('change', (e) => {
      state.includeDatacenter = e.target.checked;
      recalculateAndRender();
    });
  }

  const chkLog = document.getElementById('chkLogScale');
  if (chkLog) {
    chkLog.addEventListener('change', (e) => {
      state.isLogScale = e.target.checked;
      recalculateAndRender();
    });
  }

  // Budget / Price Range Filter for Plot
  const selPlotPrice = document.getElementById('selPlotPriceFilter');
  if (selPlotPrice) {
    selPlotPrice.addEventListener('change', (e) => {
      state.plotPriceFilter = e.target.value;
      recalculateAndRender();
    });
  }

  // Label Density Mode
  const selLabelDensity = document.getElementById('selLabelDensity');
  if (selLabelDensity) {
    selLabelDensity.addEventListener('change', (e) => {
      state.labelMode = e.target.value;
      renderScatterPlot();
    });
  }

  // Matrix Filter Controls
  const selCtx = document.getElementById('selMatrixContext');
  if (selCtx) {
    selCtx.addEventListener('change', (e) => {
      state.matrixContextTokens = parseInt(e.target.value);
      renderFitMatrix();
    });
  }

  const selClass = document.getElementById('selModelClass');
  if (selClass) {
    selClass.addEventListener('change', (e) => {
      state.modelClassFilter = e.target.value;
      renderFitMatrix();
    });
  }

  const selQuant = document.getElementById('selQuantFilter');
  if (selQuant) {
    selQuant.addEventListener('change', (e) => {
      state.quantAccuracyFilter = e.target.value;
      renderFitMatrix();
    });
  }

  const selMatrixDate = document.getElementById('selMatrixDateFilter');
  if (selMatrixDate) {
    selMatrixDate.addEventListener('change', (e) => {
      state.matrixDateFilter = e.target.value;
      renderFitMatrix();
    });
  }

  const selMatrixMinIQ = document.getElementById('selMatrixMinIQ');
  if (selMatrixMinIQ) {
    selMatrixMinIQ.addEventListener('change', (e) => {
      state.matrixMinIQ = parseFloat(e.target.value) || 0;
      renderFitMatrix();
    });
  }

  const selMatrixMaxPrice = document.getElementById('selMatrixMaxPrice');
  if (selMatrixMaxPrice) {
    selMatrixMaxPrice.addEventListener('change', (e) => {
      state.matrixMaxPrice = e.target.value;
      renderFitMatrix();
    });
  }

  // Open Models Explorer Controls
  const selModelDate = document.getElementById('selModelDateFilter');
  if (selModelDate) {
    selModelDate.addEventListener('change', (e) => {
      state.modelDateFilter = e.target.value;
      renderOpenModelsExplorer();
    });
  }

  const selModelMinIQ = document.getElementById('selModelMinIQ');
  if (selModelMinIQ) {
    selModelMinIQ.addEventListener('change', (e) => {
      state.modelMinIQ = parseFloat(e.target.value) || 0;
      renderOpenModelsExplorer();
    });
  }

  const selModelSize = document.getElementById('selModelSizeFilter');
  if (selModelSize) {
    selModelSize.addEventListener('change', (e) => {
      state.modelSizeFilter = e.target.value;
      renderOpenModelsExplorer();
    });
  }

  const selModelLab = document.getElementById('selModelLabFilter');
  if (selModelLab) {
    selModelLab.addEventListener('change', (e) => {
      state.modelLabFilter = e.target.value;
      renderOpenModelsExplorer();
    });
  }

  const selModelSort = document.getElementById('selModelSort');
  if (selModelSort) {
    selModelSort.addEventListener('change', (e) => {
      state.modelSort = e.target.value;
      renderOpenModelsExplorer();
    });
  }

  // Device Database Filters
  const selDevVendor = document.getElementById('selDeviceVendorFilter');
  if (selDevVendor) {
    selDevVendor.addEventListener('change', (e) => {
      state.deviceVendorFilter = e.target.value;
      renderDeviceTable();
    });
  }

  const selDevPrice = document.getElementById('selDevicePriceFilter');
  if (selDevPrice) {
    selDevPrice.addEventListener('change', (e) => {
      state.devicePriceFilter = e.target.value;
      renderDeviceTable();
    });
  }

  const selDevVram = document.getElementById('selDeviceVramFilter');
  if (selDevVram) {
    selDevVram.addEventListener('change', (e) => {
      state.deviceVramFilter = e.target.value;
      renderDeviceTable();
    });
  }

  // Task Economics Controls
  const selCloud = document.getElementById('selCloudApiBaseline');
  if (selCloud) {
    selCloud.addEventListener('change', (e) => {
      state.cloudApiBaseline = e.target.value;
      renderTaskEconomics();
    });
  }

  const selDaily = document.getElementById('selDailyWorkload');
  if (selDaily) {
    selDaily.addEventListener('change', (e) => {
      state.dailyTokens = parseInt(e.target.value);
      renderTaskEconomics();
    });
  }

  // Search Inputs
  const txtSearchModels = document.getElementById('txtSearchModels');
  if (txtSearchModels) {
    txtSearchModels.addEventListener('input', () => renderOpenModelsExplorer());
  }

  const txtSearchDev = document.getElementById('txtSearchDevices');
  if (txtSearchDev) {
    txtSearchDev.addEventListener('input', () => renderDeviceTable());
  }

  // Export Data
  const btnExport = document.getElementById('btnExportData');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const dataStr = JSON.stringify({
        devices: state.processedPoints,
        models: state.rawModels,
        config: state
      }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `local_ai_hardware_fit_data.json`;
      a.click();
    });
  }
}

function bindSlider(sliderId, labelId, formatter) {
  const s = document.getElementById(sliderId);
  const l = document.getElementById(labelId);
  if (s && l) {
    s.addEventListener('input', (e) => {
      l.textContent = formatter(e.target.value);
      recalculateAndRender();
    });
  }
}

function setSliderVal(sliderId, labelId, val, formatted) {
  const s = document.getElementById(sliderId);
  const l = document.getElementById(labelId);
  if (s) s.value = val;
  if (l) l.textContent = formatted;
}

function updatePlotTitles() {
  const t = document.getElementById('plotHeaderTitle');
  const sub = document.getElementById('plotHeaderSubtitle');
  if (!t || !sub) return;

  if (state.yMetric === 'iq-throughput') {
    t.textContent = 'Hardware IQ-Throughput (IQ-tok/s) vs. Price';
    sub.textContent = 'X: Effective Price (USD) · Y: Peak Realized Intelligence-Weighted Tokens/Sec across runnable models';
  } else if (state.yMetric === 'iq-per-dollar') {
    t.textContent = 'Intelligence Value Efficiency (IQ-tok/s per $1k TCO)';
    sub.textContent = 'X: Effective Price (USD) · Y: Realized IQ-tok/s generated per $1,000 total build investment';
  } else if (state.yMetric === 'cost-per-1k-tasks') {
    t.textContent = 'Local Cost per 1,000 Difficult Reasoning Tasks ($/1k Tasks)';
    sub.textContent = 'X: Effective Price (USD) · Y: Amortized Local Cost to Execute 1,000 Difficult Reasoning Tasks';
  } else {
    t.textContent = 'Local-AI Hardware Value & Pareto Frontier';
    sub.textContent = 'X: Purchase Price (USD) · Y: Multi-Factor Weighted Performance Score';
  }
}

// ================= INTERACTIVE ZOOM & PAN ENGINE =================
function initZoomPanListeners() {
  const wrapper = document.getElementById('plotWrapper');
  const btnIn = document.getElementById('btnZoomIn');
  const btnOut = document.getElementById('btnZoomOut');
  const btnReset = document.getElementById('btnResetZoom');
  const btnFullscreen = document.getElementById('btnFullscreenPlot');
  const lblZoom = document.getElementById('lblZoomLevel');

  function updateZoomLabel() {
    if (lblZoom) lblZoom.textContent = `${Math.round(state.zoomScale * 100)}%`;
  }

  function applyZoom(deltaScale, centerX, centerY) {
    const oldScale = state.zoomScale;
    let newScale = oldScale * deltaScale;
    newScale = Math.max(0.6, Math.min(8.0, newScale));
    
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const cx = centerX !== undefined ? centerX - rect.left : rect.width / 2;
      const cy = centerY !== undefined ? centerY - rect.top : rect.height / 2;
      state.panX = cx - (cx - state.panX) * (newScale / oldScale);
      state.panY = cy - (cy - state.panY) * (newScale / oldScale);
    }
    
    state.zoomScale = newScale;
    updateZoomLabel();
    renderScatterPlot();
  }

  if (btnIn) btnIn.addEventListener('click', () => applyZoom(1.3));
  if (btnOut) btnOut.addEventListener('click', () => applyZoom(0.77));
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.zoomScale = 1.0;
      state.panX = 0;
      state.panY = 0;
      updateZoomLabel();
      renderScatterPlot();
    });
  }

  function setPlotFullscreen(isFullscreen) {
    state.isPlotFullscreen = isFullscreen;
    document.body.classList.toggle('plot-fullscreen-active', isFullscreen);
    if (btnFullscreen) {
      btnFullscreen.setAttribute('aria-pressed', String(isFullscreen));
      btnFullscreen.title = isFullscreen ? 'Exit full screen' : 'Open plot full screen';
      btnFullscreen.innerHTML = isFullscreen
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/></svg> Exit'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg> Full screen';
    }
    if (wrapper) requestAnimationFrame(() => renderScatterPlot());
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => setPlotFullscreen(!state.isPlotFullscreen));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isPlotFullscreen) setPlotFullscreen(false);
  });

  if (wrapper) {
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      applyZoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    wrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      state.isDragging = true;
      state.dragStartX = e.clientX - state.panX;
      state.dragStartY = e.clientY - state.panY;
      wrapper.classList.add('is-panning');
    });

    let touchStartDistance = 0;
    let touchStartZoom = 1;
    let touchStartPanX = 0;
    let touchStartPanY = 0;
    let touchStartMidpoint = { x: 0, y: 0 };

    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const getTouchMidpoint = (touches) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    });

    wrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        touchStartDistance = getTouchDistance(e.touches);
        touchStartZoom = state.zoomScale;
        touchStartPanX = state.panX;
        touchStartPanY = state.panY;
        touchStartMidpoint = getTouchMidpoint(e.touches);
      } else if (e.touches.length === 1 && state.isPlotFullscreen) {
        e.preventDefault();
        state.isDragging = true;
        state.dragStartX = e.touches[0].clientX - state.panX;
        state.dragStartY = e.touches[0].clientY - state.panY;
        wrapper.classList.add('is-panning');
      }
    }, { passive: false });

    wrapper.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDistance > 0) {
        e.preventDefault();
        const rect = wrapper.getBoundingClientRect();
        const midpoint = getTouchMidpoint(e.touches);
        const newScale = Math.max(0.6, Math.min(8.0, touchStartZoom * (getTouchDistance(e.touches) / touchStartDistance)));
        const cx = midpoint.x - rect.left;
        const cy = midpoint.y - rect.top;
        const initialLocalMidpointX = touchStartMidpoint.x - rect.left;
        const initialLocalMidpointY = touchStartMidpoint.y - rect.top;
        state.panX = cx - (initialLocalMidpointX - touchStartPanX) * (newScale / touchStartZoom);
        state.panY = cy - (initialLocalMidpointY - touchStartPanY) * (newScale / touchStartZoom);
        state.zoomScale = newScale;
        updateZoomLabel();
        renderScatterPlot();
      } else if (e.touches.length === 1 && state.isDragging && state.isPlotFullscreen) {
        e.preventDefault();
        state.panX = e.touches[0].clientX - state.dragStartX;
        state.panY = e.touches[0].clientY - state.dragStartY;
        renderScatterPlot();
      }
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
      touchStartDistance = 0;
      if (state.isDragging) {
        state.isDragging = false;
        wrapper.classList.remove('is-panning');
      }
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;
      state.panX = e.clientX - state.dragStartX;
      state.panY = e.clientY - state.dragStartY;
      renderScatterPlot();
    });

    window.addEventListener('mouseup', () => {
      if (state.isDragging) {
        state.isDragging = false;
        wrapper.classList.remove('is-panning');
      }
    });

    wrapper.addEventListener('dblclick', () => {
      state.zoomScale = 1.0;
      state.panX = 0;
      state.panY = 0;
      updateZoomLabel();
      renderScatterPlot();
    });
  }
}

function updateFootnote() {
  const fn = document.getElementById('chartFootnote');
  if (fn) {
    if (state.useSystemContext) {
      fn.textContent = `Optional adjustments are ON: Discrete GPUs include +$${state.hostCostUsd} host platform cost; Unified systems deduct ${state.macOsOverheadGb}GB OS memory. Trendline uses visible options and the current metric.`;
    } else {
      fn.textContent = `Optional adjustments are OFF: showing hardware purchase price ($P) and full listed memory ($C). Trendline uses visible options and the current metric.`;
    }
  }
}

// ================= MATHEMATICAL MODEL & PARETO ENGINE =================
function findPeakModelAndIqThroughput(usableVram, bandwidth) {
  let bestIqTokS = 0;
  let bestModel = null;
  let bestSpeed = 0;
  let bestQuant = 'Q4';

  state.rawModels.forEach(m => {
    const req = m.memory_req_gb || {};
    const iq = m.intelligence_index || 30.0;
    
    // Check highest acceptable precision
    let quant = null;
    let memReq = 0;

    if (usableVram >= req.fp16) { quant = 'FP16'; memReq = req.fp16; }
    else if (usableVram >= req.q8_0) { quant = 'Q8'; memReq = req.q8_0; }
    else if (usableVram >= req.q5_k_m) { quant = 'Q5'; memReq = req.q5_k_m; }
    else if (usableVram >= req.q4_k_m) { quant = 'Q4'; memReq = req.q4_k_m; }
    else if (usableVram >= req.q3_k_m && m.total_params_b >= 70) { quant = 'Q3'; memReq = req.q3_k_m; }
    else if (usableVram >= req.q2_k && m.total_params_b >= 400) { quant = 'Q2'; memReq = req.q2_k; }

    if (quant) {
      const speed = Math.max(1.0, bandwidth / (memReq * 0.95));
      // Formula: (Intelligence / 10)^alpha * (Speed)^beta * 10
      const iqThroughput = Math.pow(iq / 10.0, state.weightIq) * Math.pow(speed, state.weightSpeed) * 10.0;
      
      if (iqThroughput > bestIqTokS) {
        bestIqTokS = iqThroughput;
        bestModel = m;
        bestSpeed = Math.round(speed);
        bestQuant = quant;
      }
    }
  });

  return {
    peakIqTokS: Math.round(bestIqTokS),
    peakModel: bestModel ? `${bestModel.name} (${bestQuant}, ${bestSpeed} t/s)` : 'No model fits',
    peakModelRaw: bestModel,
    peakSpeed: bestSpeed,
    peakQuant: bestQuant
  };
}

function calculateDeviceScore(dev, multiplier = 1, isTpCeiling = false) {
  const isUnified = dev.category === 'unified-memory system';
  const rawCap = parseFloat(dev.memory_capacity_gb) || 1;
  const rawBw = parseFloat(dev.local_memory_bandwidth_gbs) || 1;
  const rawFlops = parseFloat(dev.fp16_tflops) || 10;
  const isCuda = (dev.cuda_supported || 'no').toLowerCase() === 'yes';

  let effCap = rawCap * multiplier;
  if (state.useSystemContext && isUnified) {
    effCap = Math.max(2, effCap - (state.macOsOverheadGb * multiplier));
  }

  let effBw = rawBw;
  if (isTpCeiling && multiplier > 1) {
    effBw = rawBw * multiplier * state.tpEfficiency;
  }

  const effFlops = rawFlops * multiplier;
  const effBoost = isCuda ? state.cudaBoost : 1.0;

  // 1. Standard Multi-Factor Value Score
  const stdScore = Math.pow(effCap, state.weightMem) * 
                   Math.pow(effBw, state.weightBw) * 
                   Math.pow(Math.max(1, effFlops), state.weightFlops) * 
                   effBoost;

  const basePrice = parseFloat(dev.price_usd) || 1;
  let effPrice = basePrice * multiplier;
  if (state.useSystemContext && !isUnified) {
    effPrice += state.hostCostUsd;
  }

  // 2. Peak Intelligence-Throughput (IQ-tok/s)
  const iqResult = findPeakModelAndIqThroughput(effCap, effBw);
  const iqTokS = iqResult.peakIqTokS;

  // 3. IQ per $1k TCO
  const iqPerDollar = (iqTokS / Math.max(100, effPrice)) * 1000.0;

  // 4. Cost per 1,000 Reasoning Tasks ($ / 1k Tasks)
  // Assuming 1 task ~ 1,500 tokens. Hardware amortized across 500k lifetime tasks + $0.15/kWh electricity
  const powerKw = (dev.category.includes('unified') ? 0.12 : (multiplier * 0.35));
  const electricityPer1kTasks = (powerKw * 0.15 / Math.max(1, iqResult.peakSpeed * 3600)) * 1500000;
  const amortizedHardwareCost = (effPrice / 500000.0) * 1000.0;
  const costPer1kTasks = amortizedHardwareCost + electricityPer1kTasks;

  // Determine active Y value
  let activeY = stdScore;
  if (state.yMetric === 'iq-throughput') activeY = iqTokS;
  else if (state.yMetric === 'iq-per-dollar') activeY = iqPerDollar;
  else if (state.yMetric === 'cost-per-1k-tasks') activeY = costPer1kTasks;

  return {
    effCap: Math.round(effCap * 10) / 10,
    effBw: Math.round(effBw),
    effFlops: Math.round(effFlops * 10) / 10,
    effPrice: Math.round(effPrice),
    score: Math.round(stdScore),
    iqTokS,
    iqPerDollar: Math.round(iqPerDollar * 10) / 10,
    costPer1kTasks: Math.round(costPer1kTasks * 100) / 100,
    activeY: Math.round(activeY * 10) / 10,
    peakModel: iqResult.peakModel,
    peakSpeed: iqResult.peakSpeed,
    peakQuant: iqResult.peakQuant
  };
}

function processAllPoints() {
  const points = [];

  state.rawDevices.forEach(dev => {
    if (!state.allowedVendors.has(dev.vendor)) return;
    if (!state.includeModded && (dev.modified || 'no').toLowerCase() === 'yes') return;
    if (!state.includeDatacenter && parseFloat(dev.price_usd) > 50000) return;

    if (state.plotPriceFilter === 'under1k' && parseFloat(dev.price_usd) >= 1000) return;
    if (state.plotPriceFilter === '1k-3k' && (parseFloat(dev.price_usd) < 1000 || parseFloat(dev.price_usd) > 3000)) return;
    if (state.plotPriceFilter === '3k-10k' && (parseFloat(dev.price_usd) < 3000 || parseFloat(dev.price_usd) > 10000)) return;
    if (state.plotPriceFilter === '10k-50k' && (parseFloat(dev.price_usd) < 10000 || parseFloat(dev.price_usd) > 50000)) return;
    if (state.plotPriceFilter === 'datacenter' && parseFloat(dev.price_usd) < 50000) return;

    const single = calculateDeviceScore(dev, 1, false);
    points.push({
      id: `${dev.id}_1x`,
      baseId: dev.id,
      name: dev.device_name,
      vendor: dev.vendor,
      category: dev.category,
      modified: dev.modified,
      multiplier: 1,
      pointType: dev.category === 'unified-memory system' ? 'diamond' : 'circle',
      effPrice: single.effPrice,
      effCap: single.effCap,
      effBw: single.effBw,
      effFlops: single.effFlops,
      score: single.score,
      iqTokS: single.iqTokS,
      iqPerDollar: single.iqPerDollar,
      costPer1kTasks: single.costPer1kTasks,
      activeY: single.activeY,
      peakModel: single.peakModel,
      rawDevice: dev,
      label: dev.device_name
    });

    if (state.chartMode === 'capacity' || state.chartMode === 'tp-ceiling') {
      const sharded = calculateDeviceScore(dev, 2, false);
      points.push({
        id: `${dev.id}_2x_cap`,
        baseId: dev.id,
        name: `2x ${dev.device_name} (Cap Sharded)`,
        vendor: dev.vendor,
        category: dev.category,
        modified: dev.modified,
        multiplier: 2,
        pointType: 'square',
        effPrice: sharded.effPrice,
        effCap: sharded.effCap,
        effBw: sharded.effBw,
        effFlops: sharded.effFlops,
        score: sharded.score,
        iqTokS: sharded.iqTokS,
        iqPerDollar: sharded.iqPerDollar,
        costPer1kTasks: sharded.costPer1kTasks,
        activeY: sharded.activeY,
        peakModel: sharded.peakModel,
        rawDevice: dev,
        label: `2x ${dev.device_name}`
      });
    }

    if (state.chartMode === 'tp-ceiling') {
      const tp = calculateDeviceScore(dev, 2, true);
      points.push({
        id: `${dev.id}_2x_tp`,
        baseId: dev.id,
        name: `2x ${dev.device_name} (TP Ceiling)`,
        vendor: dev.vendor,
        category: dev.category,
        modified: dev.modified,
        multiplier: 2,
        pointType: 'triangle',
        effPrice: tp.effPrice,
        effCap: tp.effCap,
        effBw: tp.effBw,
        effFlops: tp.effFlops,
        score: tp.score,
        iqTokS: tp.iqTokS,
        iqPerDollar: tp.iqPerDollar,
        costPer1kTasks: tp.costPer1kTasks,
        activeY: tp.activeY,
        peakModel: tp.peakModel,
        rawDevice: dev,
        label: `2x ${dev.device_name} [TP]`
      });
    }
  });

  // Calculate Pareto Frontier
  points.sort((a, b) => a.effPrice - b.effPrice || b.activeY - a.activeY);

  let maxVal = -Infinity;
  const paretoPoints = [];

  points.forEach(pt => {
    if (pt.activeY > maxVal) {
      pt.isPareto = true;
      maxVal = pt.activeY;
      paretoPoints.push(pt);
    } else {
      pt.isPareto = false;
    }
  });

  state.processedPoints = points;
  state.paretoPoints = paretoPoints;
}

function recalculateAndRender() {
  processAllPoints();
  renderScatterPlot();
  renderFitMatrix();
  renderOpenModelsExplorer();
  renderTaskEconomics();
  renderDeviceTable();
  if (state.selectedDeviceId) {
    const selectedPointStillVisible = state.selectedPointId && state.processedPoints.some(pt => pt.id === state.selectedPointId);
    selectDevice(state.selectedDeviceId, selectedPointStillVisible ? state.selectedPointId : null);
  }
}

// Fit the visible price/performance relationship in the same scale used by the chart.
// Log-log regression keeps the trendline meaningful across the very wide price range.
function calculateTrendline(points = state.processedPoints) {
  const validPoints = points.filter(pt =>
    Number.isFinite(pt.effPrice) && pt.effPrice > 0 &&
    Number.isFinite(pt.activeY) && pt.activeY > 0
  );
  if (validPoints.length < 2) return null;

  const xValues = validPoints.map(pt => state.isLogScale ? Math.log10(pt.effPrice) : pt.effPrice);
  const yValues = validPoints.map(pt => state.isLogScale ? Math.log10(pt.activeY) : pt.activeY);
  const xMean = xValues.reduce((sum, value) => sum + value, 0) / xValues.length;
  const yMean = yValues.reduce((sum, value) => sum + value, 0) / yValues.length;
  const denominator = xValues.reduce((sum, value) => sum + Math.pow(value - xMean, 2), 0);
  if (denominator <= Number.EPSILON) return null;

  const slope = xValues.reduce((sum, value, index) => sum + ((value - xMean) * (yValues[index] - yMean)), 0) / denominator;
  const intercept = yMean - (slope * xMean);

  return {
    mode: state.isLogScale ? 'log-log' : 'linear',
    slope,
    intercept,
    predictY: (price) => {
      const x = state.isLogScale ? Math.log10(Math.max(price, 0.01)) : price;
      const y = intercept + (slope * x);
      return state.isLogScale ? Math.pow(10, y) : y;
    },
    priceForY: (performance) => {
      if (Math.abs(slope) <= Number.EPSILON || !Number.isFinite(performance) || performance <= 0) return null;
      const y = state.isLogScale ? Math.log10(performance) : performance;
      const x = (y - intercept) / slope;
      return state.isLogScale ? Math.pow(10, x) : x;
    }
  };
}

function comparePointToTrendline(pt, trendline = calculateTrendline()) {
  if (!pt || !trendline) return null;
  const expectedPrice = trendline.priceForY(pt.activeY);
  if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) return null;

  const delta = expectedPrice - pt.effPrice;
  const tolerance = Math.max(25, expectedPrice * 0.01);
  const relation = Math.abs(delta) <= tolerance ? 'at average' : (delta > 0 ? 'ahead' : 'behind');
  return { expectedPrice, delta, relation, relationClass: relation.replace(' ', '-') };
}

function formatUsd(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

// ================= SCATTER PLOT SVG RENDERING WITH VENDOR COLORS & SMART ANNOTATIONS =================
function renderScatterPlot() {
  const svg = document.getElementById('hardwareScatterPlot');
  const wrapper = document.getElementById('plotWrapper');
  if (!svg || !wrapper || state.processedPoints.length === 0) return;

  const width = wrapper.clientWidth || 900;
  const height = wrapper.clientHeight || 620;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = '';

  const margin = { top: 30, right: 40, bottom: 55, left: 75 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const minPrice = Math.min(...state.processedPoints.map(p => p.effPrice));
  const maxPrice = Math.max(...state.processedPoints.map(p => p.effPrice));
  const minY = Math.min(...state.processedPoints.map(p => p.activeY));
  const maxY = Math.max(...state.processedPoints.map(p => p.activeY));

  const xMin = state.isLogScale ? Math.max(100, minPrice * 0.8) : 0;
  const xMax = maxPrice * 1.25;
  const yMin = state.isLogScale ? Math.max(1, minY * 0.8) : 0;
  const yMax = maxY * 1.35;

  function getBaseX(val) {
    if (state.isLogScale) {
      const logMin = Math.log10(xMin);
      const logMax = Math.log10(xMax);
      return margin.left + ((Math.log10(Math.max(val, xMin)) - logMin) / (logMax - logMin)) * plotWidth;
    }
    return margin.left + (val / xMax) * plotWidth;
  }

  function getBaseY(val) {
    if (state.isLogScale) {
      const logMin = Math.log10(yMin);
      const logMax = Math.log10(yMax);
      return margin.top + plotHeight - ((Math.log10(Math.max(val, yMin)) - logMin) / (logMax - logMin)) * plotHeight;
    }
    return margin.top + plotHeight - (val / yMax) * plotHeight;
  }

  function getX(val) {
    const bx = getBaseX(val);
    return state.panX + bx * state.zoomScale;
  }

  function getY(val) {
    const by = getBaseY(val);
    return state.panY + by * state.zoomScale;
  }

  const trendline = calculateTrendline();

  // Draw Grid Lines
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'grid-group');

  const xTicks = state.isLogScale 
    ? [200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000].filter(t => t >= xMin && t <= xMax)
    : [0, 2000, 5000, 10000, 20000, 50000, 100000, 200000];

  xTicks.forEach(tick => {
    const x = getX(tick);
    if (x >= margin.left && x <= width - margin.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', margin.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', margin.top + plotHeight);
      line.setAttribute('class', 'grid-line');
      gridGroup.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', margin.top + plotHeight + 18);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'axis-tick-text');
      text.textContent = tick >= 1000 ? `$${tick/1000}k` : `$${tick}`;
      gridGroup.appendChild(text);
    }
  });

  // Y-Axis Ticks
  const yTicks = state.isLogScale
    ? [10, 50, 200, 1000, 5000, 20000, 100000, 500000, 2000000, 10000000].filter(t => t >= yMin && t <= yMax)
    : [0, 500, 2000, 10000, 50000, 200000, 1000000];

  yTicks.forEach(tick => {
    const y = getY(tick);
    if (y >= margin.top && y <= margin.top + plotHeight) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', margin.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', margin.left + plotWidth);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'grid-line');
      gridGroup.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', margin.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'axis-tick-text');
      text.textContent = tick >= 1000000 ? `${(tick/1000000).toFixed(0)}M` : (tick >= 1000 ? `${(tick/1000).toFixed(0)}k` : tick);
      gridGroup.appendChild(text);
    }
  });

  svg.appendChild(gridGroup);

  // Axis Labels
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', margin.left + plotWidth / 2);
  xLabel.setAttribute('y', margin.top + plotHeight + 42);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('class', 'axis-label');
  xLabel.textContent = state.useSystemContext 
    ? 'Effective Build Price / TCO (USD) [Discrete +$650 Host Platform Cost, Unified $0 Host]'
    : 'Hardware Purchase Price (USD)';
  svg.appendChild(xLabel);

  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('transform', `rotate(-90)`);
  yLabel.setAttribute('x', -(margin.top + plotHeight / 2));
  yLabel.setAttribute('y', 20);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('class', 'axis-label');
  
  if (state.yMetric === 'iq-throughput') {
    yLabel.textContent = `Peak IQ-Throughput [IQ-tok/s = (Intelligence/10)^${state.weightIq} × tok/s^${state.weightSpeed}]`;
  } else if (state.yMetric === 'iq-per-dollar') {
    yLabel.textContent = `Intelligence Value Efficiency [IQ-tok/s per $1,000 TCO]`;
  } else if (state.yMetric === 'cost-per-1k-tasks') {
    yLabel.textContent = `Cost to Execute 1,000 Complex Reasoning Tasks ($ USD / 1k Tasks)`;
  } else {
    yLabel.textContent = `Performance Score [C^${state.weightMem} · B^${state.weightBw} · T^${state.weightFlops} · CUDA]`;
  }
  svg.appendChild(yLabel);

  // Draw the average price/performance trendline for the currently visible options.
  if (trendline) {
    // Find intersection of trendline with chart boundaries [xMin, xMax] x [yMin, yMax]
    let x1 = xMin;
    let y1 = trendline.predictY(x1);
    if (y1 < yMin) {
      y1 = yMin;
      x1 = trendline.priceForY(y1);
    } else if (y1 > yMax) {
      y1 = yMax;
      x1 = trendline.priceForY(y1);
    }

    let x2 = xMax;
    let y2 = trendline.predictY(x2);
    if (y2 > yMax) {
      y2 = yMax;
      x2 = trendline.priceForY(y2);
    } else if (y2 < yMin) {
      y2 = yMin;
      x2 = trendline.priceForY(y2);
    }

    if (Number.isFinite(x1) && Number.isFinite(y1) && Number.isFinite(x2) && Number.isFinite(y2)) {
      const trendlinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      trendlinePath.setAttribute('d', `M ${getX(x1)} ${getY(y1)} L ${getX(x2)} ${getY(y2)}`);
      trendlinePath.setAttribute('class', 'trendline');
      trendlinePath.setAttribute('aria-label', `${trendline.mode} average price-performance trendline`);
      svg.appendChild(trendlinePath);
    }
  }

  // When a point is selected, project its performance onto the trendline and
  // show the price gap on the x-axis: positive means cheaper/better value.
  const selectedPoint = (state.selectedPointId && state.processedPoints.find(pt => pt.id === state.selectedPointId))
    || state.processedPoints.find(pt => pt.baseId === state.selectedDeviceId && pt.multiplier === 1);
  const selectedComparison = comparePointToTrendline(selectedPoint, trendline);
  if (selectedPoint && selectedComparison) {
    const actualX = getX(selectedPoint.effPrice);
    const projectedPrice = selectedComparison.expectedPrice;
    const clampedProjectedX = Math.max(margin.left, Math.min(width - margin.right, getX(projectedPrice)));
    const pointY = getY(selectedPoint.activeY);
    const gapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gapGroup.setAttribute('class', `selection-gap-annotation ${selectedComparison.relationClass}`);

    const gapLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gapLine.setAttribute('x1', actualX);
    gapLine.setAttribute('y1', pointY);
    gapLine.setAttribute('x2', clampedProjectedX);
    gapLine.setAttribute('y2', pointY);
    gapLine.setAttribute('class', 'selection-gap-line');
    gapGroup.appendChild(gapLine);

    [actualX, clampedProjectedX].forEach((x, idx) => {
      const endpoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endpoint.setAttribute('cx', x);
      endpoint.setAttribute('cy', pointY);
      endpoint.setAttribute('r', idx === 1 ? 4 : 3);
      endpoint.setAttribute('class', 'selection-gap-endpoint');
      gapGroup.appendChild(endpoint);
    });

    const labelText = selectedComparison.relation === 'at average'
      ? 'At average'
      : `${selectedComparison.relation === 'ahead' ? 'Ahead' : 'Behind'} avg by ${formatUsd(Math.abs(selectedComparison.delta))}`;

    const badgeW = labelText.length * 6.5 + 16;
    const badgeH = 18;
    const midX = Math.max(margin.left + badgeW / 2 + 6, Math.min(width - margin.right - badgeW / 2 - 6, (actualX + clampedProjectedX) / 2));
    const labelY = (pointY < margin.top + 35) ? pointY + 16 : pointY - 14;

    const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    badgeRect.setAttribute('x', midX - badgeW / 2);
    badgeRect.setAttribute('y', labelY - badgeH / 2);
    badgeRect.setAttribute('width', badgeW);
    badgeRect.setAttribute('height', badgeH);
    badgeRect.setAttribute('rx', 2);
    badgeRect.setAttribute('class', `selection-gap-badge-bg ${selectedComparison.relationClass}`);
    gapGroup.appendChild(badgeRect);

    const gapLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    gapLabel.setAttribute('x', midX);
    gapLabel.setAttribute('y', labelY + 3.5);
    gapLabel.setAttribute('text-anchor', 'middle');
    gapLabel.setAttribute('class', `selection-gap-label ${selectedComparison.relationClass}`);
    gapLabel.textContent = labelText;
    gapGroup.appendChild(gapLabel);

    svg.appendChild(gapGroup);
  }

  // Draw Pareto Frontier Path
  if (state.paretoPoints && state.paretoPoints.length > 1) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';
    state.paretoPoints.forEach((pt, idx) => {
      const px = getX(pt.effPrice);
      const py = getY(pt.activeY);
      d += (idx === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
    });
    path.setAttribute('d', d);
    path.setAttribute('class', 'pareto-line');
    svg.appendChild(path);
  }

  // Draw Data Markers with TACTICAL RETICLES & PARETO GOLD HALOS
  const markersGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  state.processedPoints.forEach(pt => {
    const px = getX(pt.effPrice);
    const py = getY(pt.activeY);
    const isSelected = state.selectedPointId
      ? pt.id === state.selectedPointId
      : pt.baseId === state.selectedDeviceId && pt.multiplier === 1;
    const isPareto = pt.isPareto;

    const vendorTheme = VENDOR_COLORS[pt.vendor] || VENDOR_COLORS['ASUS'];
    const fillColor = vendorTheme.fill;
    const strokeColor = isSelected ? '#ffffff' : vendorTheme.stroke;
    const radius = (isPareto ? 6.5 : 5.0) * Math.min(1.3, Math.max(0.85, Math.sqrt(state.zoomScale)));

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.setAttribute('class', `data-marker ${isSelected ? 'is-selected' : ''}`);
    marker.setAttribute('data-id', pt.baseId);

    // If Pareto, draw glowing solar gold halo ring
    if (isPareto) {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', px);
      halo.setAttribute('cy', py);
      halo.setAttribute('r', radius + 4.5);
      halo.setAttribute('class', 'pareto-halo-ring');
      marker.appendChild(halo);
    }

    if (pt.pointType === 'circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', isSelected ? 2.5 : 1.2);
      marker.appendChild(circle);
    } else if (pt.pointType === 'diamond') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const r = radius * 1.15;
      poly.setAttribute('points', `${px},${py - r} ${px + r},${py} ${px},${py + r} ${px - r},${py}`);
      poly.setAttribute('fill', fillColor);
      poly.setAttribute('stroke', strokeColor);
      poly.setAttribute('stroke-width', isSelected ? 2.5 : 1.2);
      marker.appendChild(poly);
    } else if (pt.pointType === 'square') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const s = radius * 1.6;
      rect.setAttribute('x', px - s/2);
      rect.setAttribute('y', py - s/2);
      rect.setAttribute('width', s);
      rect.setAttribute('height', s);
      rect.setAttribute('rx', 1);
      rect.setAttribute('fill', fillColor);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', isSelected ? 2.5 : 1.2);
      marker.appendChild(rect);
    } else if (pt.pointType === 'triangle') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const r = radius * 1.3;
      poly.setAttribute('points', `${px},${py - r} ${px + r * 0.866},${py + r * 0.5} ${px - r * 0.866},${py + r * 0.5}`);
      poly.setAttribute('fill', fillColor);
      poly.setAttribute('stroke', strokeColor);
      poly.setAttribute('stroke-width', isSelected ? 2.5 : 1.2);
      marker.appendChild(poly);
    }

    // Reticle Center Core
    const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    core.setAttribute('cx', px);
    core.setAttribute('cy', py);
    core.setAttribute('r', 1.5);
    core.setAttribute('fill', '#05080c');
    marker.appendChild(core);

    // If Selected, draw target crosshair brackets
    if (isSelected) {
      const crosshair = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      crosshair.setAttribute('stroke', '#00f0ff');
      crosshair.setAttribute('stroke-width', '1.2');
      const cr = radius + 7;
      crosshair.innerHTML = `
        <line x1="${px - cr}" y1="${py}" x2="${px - cr + 3}" y2="${py}" />
        <line x1="${px + cr}" y1="${py}" x2="${px + cr - 3}" y2="${py}" />
        <line x1="${px}" y1="${py - cr}" x2="${px}" y2="${py - cr + 3}" />
        <line x1="${px}" y1="${py + cr}" x2="${px}" y2="${py + cr - 3}" />
      `;
      marker.appendChild(crosshair);
    }

    marker.addEventListener('mouseenter', (e) => showTooltip(e, pt));
    marker.addEventListener('mousemove', (e) => moveTooltip(e));
    marker.addEventListener('mouseleave', () => hideTooltip());
    marker.addEventListener('click', () => selectDevice(pt.baseId, pt.id));

    markersGroup.appendChild(marker);
  });

  // ================= ADAPTIVE ZERO-OVERLAP HUD ANNOTATIONS =================
  const placedBoxes = [];

  // Determine candidate points to label based on mode & prominence
  const pointsToLabel = state.processedPoints.filter(pt => {
    const isSelected = state.selectedPointId
      ? pt.id === state.selectedPointId
      : pt.baseId === state.selectedDeviceId && pt.multiplier === 1;
    
    if (isSelected) return true;
    if (state.labelMode === 'none') return false;
    if (state.labelMode === 'pareto') return pt.isPareto;
    if (state.labelMode === 'all') return true;
    // Auto Mode: Show Pareto frontier by default; if zoomed in, show more points
    if (state.labelMode === 'auto') {
      return (state.zoomScale >= 1.4) ? true : pt.isPareto;
    }
    return false;
  });

  // Sort: Selected first, then Pareto, then higher score
  pointsToLabel.sort((a, b) => {
    const aSel = a.baseId === state.selectedDeviceId ? 1 : 0;
    const bSel = b.baseId === state.selectedDeviceId ? 1 : 0;
    if (aSel !== bSel) return bSel - aSel;
    if (a.isPareto !== b.isPareto) return (b.isPareto ? 1 : 0) - (a.isPareto ? 1 : 0);
    return b.activeY - a.activeY;
  });

  pointsToLabel.forEach(pt => {
    const px = getX(pt.effPrice);
    const py = getY(pt.activeY);
    if (px < margin.left - 20 || px > width - margin.right + 20 || py < margin.top - 20 || py > margin.top + plotHeight + 20) {
      return; // Offscreen
    }

    const isSelected = state.selectedPointId
      ? pt.id === state.selectedPointId
      : pt.baseId === state.selectedDeviceId && pt.multiplier === 1;
    const isPareto = pt.isPareto;
    const vendorTheme = VENDOR_COLORS[pt.vendor] || VENDOR_COLORS['ASUS'];

    // Concise, high-density label text
    const shortPrice = pt.effPrice >= 1000 ? `$${(pt.effPrice/1000).toFixed(pt.effPrice >= 10000 ? 0 : 1)}k` : `$${pt.effPrice}`;
    let labelText = `${pt.label} · ${shortPrice}`;
    if (state.yMetric === 'iq-throughput') {
      labelText = `${pt.label} · ${pt.iqTokS} IQ-t/s`;
    } else if (state.yMetric === 'cost-per-1k-tasks') {
      labelText = `${pt.label} · $${pt.costPer1kTasks}/1k`;
    }

    const boxW = Math.max(70, labelText.length * 6.2 + 10);
    const boxH = 16; // Ultra-compact 16px height

    // Candidate positions (top-right, bottom-right, top-left, bottom-left, stacked)
    const candidateOffsets = [
      { ox: 14, oy: -18 },
      { ox: 14, oy: 6 },
      { ox: -boxW - 14, oy: -18 },
      { ox: -boxW - 14, oy: 6 },
      { ox: 14, oy: -34 },
      { ox: -boxW - 14, oy: -34 },
      { ox: 14, oy: 22 },
      { ox: -boxW - 14, oy: 22 }
    ];

    let bestBox = null;
    let minOverlaps = Infinity;

    for (const offset of candidateOffsets) {
      const bx = px + offset.ox;
      const by = py + offset.oy;

      // Check bounds
      if (bx < margin.left - 10 || bx + boxW > width - margin.right + 10 || by < margin.top - 10 || by + boxH > margin.top + plotHeight + 10) {
        continue;
      }

      // Count collisions with already placed boxes
      let overlaps = 0;
      for (const pb of placedBoxes) {
        const xOverlap = Math.max(0, Math.min(bx + boxW, pb.x + pb.w) - Math.max(bx, pb.x));
        const yOverlap = Math.max(0, Math.min(by + boxH, pb.y + pb.h) - Math.max(by, pb.y));
        if (xOverlap > 0 && yOverlap > 0) {
          overlaps += (xOverlap * yOverlap);
        }
      }

      if (overlaps === 0) {
        bestBox = { x: bx, y: by, w: boxW, h: boxH, ox: offset.ox, oy: offset.oy };
        break;
      } else if (overlaps < minOverlaps) {
        minOverlaps = overlaps;
        bestBox = { x: bx, y: by, w: boxW, h: boxH, ox: offset.ox, oy: offset.oy };
      }
    }

    if (!bestBox && !isSelected && !isPareto) {
      return; // Skip non-essential overlapping label
    }

    if (!bestBox) {
      bestBox = { x: px + 14, y: py - 18, w: boxW, h: boxH, ox: 14, oy: -18 };
    }

    placedBoxes.push(bestBox);

    // Render Label Group
    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelGroup.setAttribute('class', `callout-box ${isSelected ? 'is-selected' : ''}`);
    labelGroup.addEventListener('click', () => selectDevice(pt.baseId, pt.id));

    // Sleek Leader Line with Reticle
    const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leader.setAttribute('x1', px);
    leader.setAttribute('y1', py);
    leader.setAttribute('x2', bestBox.ox > 0 ? bestBox.x : bestBox.x + bestBox.w);
    leader.setAttribute('y2', bestBox.y + bestBox.h / 2);
    leader.setAttribute('class', 'leader-line');
    if (isPareto) leader.setAttribute('stroke', 'rgba(255, 215, 0, 0.6)');
    labelsGroup.appendChild(leader);

    // Callout Box Background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', bestBox.x);
    rect.setAttribute('y', bestBox.y);
    rect.setAttribute('width', bestBox.w);
    rect.setAttribute('height', bestBox.h);
    rect.setAttribute('class', 'callout-rect');
    
    if (isSelected) {
      rect.setAttribute('stroke', '#00f0ff');
      rect.setAttribute('fill', 'rgba(0, 240, 255, 0.22)');
    } else if (isPareto) {
      rect.setAttribute('stroke', 'rgba(255, 215, 0, 0.8)');
      rect.setAttribute('fill', 'rgba(10, 16, 24, 0.95)');
    } else {
      rect.setAttribute('stroke', 'rgba(26, 39, 54, 0.9)');
      rect.setAttribute('fill', 'rgba(5, 8, 12, 0.92)');
    }
    labelGroup.appendChild(rect);

    // Callout Text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', bestBox.x + 5);
    text.setAttribute('y', bestBox.y + 11.5);
    text.setAttribute('class', 'callout-text-title');
    if (isPareto && !isSelected) {
      text.setAttribute('fill', '#ffd700');
    } else if (isSelected) {
      text.setAttribute('fill', '#ffffff');
    } else {
      text.setAttribute('fill', vendorTheme.fill);
    }
    text.textContent = labelText;
    labelGroup.appendChild(text);

    labelsGroup.appendChild(labelGroup);
  });

  svg.appendChild(markersGroup);
  svg.appendChild(labelsGroup);
}

function showTooltip(e, pt) {
  const tt = document.getElementById('plotTooltip');
  if (!tt) return;
  const comparison = comparePointToTrendline(pt);
  const comparisonText = comparison
    ? (comparison.relation === 'at average'
      ? 'At average'
      : `${comparison.relation === 'ahead' ? 'Ahead' : 'Behind'} by ${formatUsd(Math.abs(comparison.delta))}`)
    : 'Unavailable';
  const comparisonColor = comparison?.relation === 'ahead' ? '#00ff66' : (comparison?.relation === 'behind' ? '#ff6600' : '#a78bfa');
  tt.style.display = 'block';
  tt.innerHTML = `
    <div class="tooltip-title">${pt.name}</div>
    <div class="tooltip-grid">
      <span class="tooltip-lbl">Vendor / Architecture:</span>
      <span class="tooltip-val" style="color:${VENDOR_COLORS[pt.vendor]?.fill || '#fff'}">${pt.vendor} (${pt.category})</span>

      <span class="tooltip-lbl">System TCO / Price:</span>
      <span class="tooltip-val" style="color:#00f0ff">$${pt.effPrice.toLocaleString()}</span>

      <span class="tooltip-lbl">vs. Average Trendline:</span>
      <span class="tooltip-val" style="color:${comparisonColor}">${comparisonText}</span>

      <span class="tooltip-lbl">Usable AI Memory:</span>
      <span class="tooltip-val">${pt.effCap} GB (${pt.rawDevice.memory_type || 'VRAM'})</span>

      <span class="tooltip-lbl">Local Memory Bandwidth:</span>
      <span class="tooltip-val">${pt.effBw} GB/s</span>

      <span class="tooltip-lbl">Peak Model Fit:</span>
      <span class="tooltip-val" style="color:#d4ff00">${pt.peakModel}</span>

      <span class="tooltip-lbl">Peak IQ-Throughput:</span>
      <span class="tooltip-val" style="color:#00ff66">${pt.iqTokS.toLocaleString()} IQ-tok/s</span>

      <span class="tooltip-lbl">Cost / 1k Tasks:</span>
      <span class="tooltip-val" style="color:#34d399">$${pt.costPer1kTasks}</span>

      <span class="tooltip-lbl">Value Score:</span>
      <span class="tooltip-val" style="color:#ffd700">${pt.score.toLocaleString()}</span>

      <span class="tooltip-lbl">Pareto Frontier:</span>
      <span class="tooltip-val" style="color:${pt.isPareto ? '#ffd700' : '#728aa3'}">${pt.isPareto ? '★ Pareto-Optimal' : 'Dominated'}</span>
    </div>
  `;
  moveTooltip(e);
}

function moveTooltip(e) {
  const tt = document.getElementById('plotTooltip');
  const wrapper = document.getElementById('plotWrapper');
  if (!tt || !wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  tt.style.left = `${x}px`;
  tt.style.top = `${y}px`;
}

function hideTooltip() {
  const tt = document.getElementById('plotTooltip');
  if (tt) tt.style.display = 'none';
}

// ================= DEVICE INSPECTOR DRAWER =================
function selectDevice(deviceId, pointId = null) {
  state.selectedDeviceId = deviceId;
  state.selectedPointId = pointId;
  state.selectedExplorerHardwareId = deviceId;
  
  const dev = state.rawDevices.find(d => d.id === deviceId);
  const drawer = document.getElementById('deviceDetailDrawer');
  const body = document.getElementById('drawerBody');
  const catBadge = document.getElementById('detCategory');

  if (!dev || !drawer || !body) return;

  const vendorTheme = VENDOR_COLORS[dev.vendor] || VENDOR_COLORS['ASUS'];
  catBadge.textContent = `${dev.vendor} · ${dev.category}`;
  catBadge.className = `badge badge-${dev.vendor.toLowerCase()}`;

  const selectedPoint = (pointId && state.processedPoints.find(pt => pt.id === pointId))
    || state.processedPoints.find(pt => pt.baseId === deviceId && pt.multiplier === 1);
  const multiplier = selectedPoint ? (selectedPoint.multiplier || 1) : 1;
  const isTp = selectedPoint ? (selectedPoint.pointType === 'triangle') : false;
  const calc = calculateDeviceScore(dev, multiplier, isTp);
  const comparison = comparePointToTrendline(selectedPoint);

  body.innerHTML = `
    <div class="device-spec-hero">
      <h3 class="device-spec-name" style="color:${vendorTheme.fill}">${dev.device_name}</h3>
      <div class="device-spec-price-row">
        <span class="device-spec-price">$${parseFloat(dev.price_usd).toLocaleString()}</span>
        <span class="device-spec-tco">· System TCO: <strong>$${calc.effPrice.toLocaleString()}</strong></span>
      </div>
    </div>

    <div class="spec-metrics-grid">
      <div class="spec-metric-card">
        <div class="spec-metric-label">Memory Capacity</div>
        <div class="spec-metric-value">${calc.effCap} GB <small style="font-size:0.65rem;color:#728aa3">(${dev.memory_capacity_gb}GB raw)</small></div>
      </div>
      <div class="spec-metric-card">
        <div class="spec-metric-label">Memory Bandwidth</div>
        <div class="spec-metric-value">${dev.local_memory_bandwidth_gbs} GB/s</div>
      </div>
      <div class="spec-metric-card">
        <div class="spec-metric-label">Peak IQ-Throughput</div>
        <div class="spec-metric-value" style="color:#00ff66">${calc.iqTokS.toLocaleString()} <small style="font-size:0.62rem">IQ-tok/s</small></div>
      </div>
      <div class="spec-metric-card">
        <div class="spec-metric-label">Cost / 1k Tasks</div>
        <div class="spec-metric-value" style="color:#34d399">$${calc.costPer1kTasks}</div>
      </div>
    </div>

    ${comparison ? `
    <div class="trendline-comparison-card ${comparison.relationClass}">
      <div class="spec-metric-label">Average Trendline Position</div>
      <div class="trendline-comparison-value">${comparison.relation === 'at average' ? 'At average' : `${comparison.relation === 'ahead' ? 'Ahead' : 'Behind'} by ${formatUsd(Math.abs(comparison.delta))}`}</div>
      <div class="trendline-comparison-note">At this performance level, the fitted average price is ${formatUsd(comparison.expectedPrice)}.</div>
    </div>
    ` : ''}

    <div class="spec-notes-section">
      <div class="spec-note-item" style="border-left-color:#d4ff00">
        <div class="spec-note-title">Optimal Model Pairing</div>
        <div class="spec-note-desc"><strong>${calc.peakModel}</strong></div>
      </div>

      <div class="spec-note-item">
        <div class="spec-note-title">Memory & Architecture</div>
        <div class="spec-note-desc">${dev.gpu_addressable_memory_note || dev.memory_type}</div>
      </div>

      <div class="spec-note-item">
        <div class="spec-note-title">Interconnect & Scalability</div>
        <div class="spec-note-desc">
          PCIe: ${dev.pcie || '—'} · NVLink: ${dev.nvlink || 'no'} · TB5: ${dev.thunderbolt5 || 'no'} · ConnectX-7: ${dev.connectx7 || 'no'}
        </div>
      </div>

      <div class="spec-note-item">
        <div class="spec-note-title">Pricing Provenance & Quality</div>
        <div class="spec-note-desc">
          Basis: ${dev.price_basis} · Quality: <strong>${dev.price_quality}</strong> · Checked: ${dev.price_as_of}
        </div>
      </div>

      ${dev.caveats ? `
      <div class="spec-note-item" style="border-left-color:#ff6600">
        <div class="spec-note-title">System Caveats</div>
        <div class="spec-note-desc">${dev.caveats}</div>
      </div>
      ` : ''}
    </div>
  `;

  renderScatterPlot();
}

// ================= TAB 2: HARDWARE-MODEL FIT MATRIX =================
function renderFitMatrix() {
  const tableBody = document.getElementById('matrixBody');
  const headerRow = document.getElementById('matrixHeaderRow');
  if (!tableBody || !headerRow || state.rawModels.length === 0) return;

  // Filter models
  let models = state.rawModels;
  if (state.modelClassFilter === 'compact') models = models.filter(m => m.total_params_b <= 14);
  else if (state.modelClassFilter === 'mid') models = models.filter(m => m.total_params_b > 14 && m.total_params_b <= 70.6);
  else if (state.modelClassFilter === 'large') models = models.filter(m => m.total_params_b > 70.6 && m.total_params_b <= 150);
  else if (state.modelClassFilter === 'ultra') models = models.filter(m => m.total_params_b > 150);

  if (state.matrixDateFilter === '2026') models = models.filter(m => (m.release_date || '').startsWith('2026'));
  else if (state.matrixDateFilter === '2025') models = models.filter(m => (m.release_date || '') >= '2025-01-01');
  else if (state.matrixDateFilter === '2024') models = models.filter(m => (m.release_date || '').startsWith('2024'));

  if (state.matrixMinIQ > 0) {
    models = models.filter(m => (m.intelligence_index || 0) >= state.matrixMinIQ);
  }

  while (headerRow.children.length > 2) {
    headerRow.removeChild(headerRow.lastChild);
  }

  models.forEach(m => {
    const th = document.createElement('th');
    const relYear = (m.release_date || '').slice(0, 7);
    th.innerHTML = `
      <div style="font-weight:700;color:#fff">${m.name}</div>
      <div style="font-size:0.68rem;color:#00f0ff;font-family:var(--font-mono);margin-top:2px;">
        <span class="badge" style="background:rgba(0,240,255,0.12);color:#00f0ff;border:1px solid rgba(0,240,255,0.3);font-size:0.62rem;padding:1px 4px;">${relYear}</span>
        ${m.total_params_b}B · IQ <strong>${m.intelligence_index}</strong>
      </div>
      <div style="font-size:0.62rem;color:#728aa3;margin-top:1px;">MATH: ${m.aa_math_500 || '-'}% · Code: ${m.aa_coding_humaneval || '-'}%</div>
    `;
    headerRow.appendChild(th);
  });

  tableBody.innerHTML = '';
  state.rawDevices.forEach(dev => {
    if (!state.allowedVendors.has(dev.vendor)) return;
    if (!state.includeModded && (dev.modified || 'no').toLowerCase() === 'yes') return;
    if (!state.includeDatacenter && parseFloat(dev.price_usd) > 50000) return;

    const calc = calculateDeviceScore(dev, 1, false);

    // Matrix Max Hardware Price Filter
    if (state.matrixMaxPrice === 'under1k' && calc.effPrice >= 1000) return;
    if (state.matrixMaxPrice === '1k-3k' && (calc.effPrice < 1000 || calc.effPrice > 3000)) return;
    if (state.matrixMaxPrice === '3k-10k' && (calc.effPrice < 3000 || calc.effPrice > 10000)) return;
    if (state.matrixMaxPrice === '10k-50k' && (calc.effPrice < 10000 || calc.effPrice > 50000)) return;
    if (state.matrixMaxPrice === 'datacenter' && calc.effPrice < 50000) return;

    const usableVram = calc.effCap;
    const bw = parseFloat(dev.local_memory_bandwidth_gbs) || 1;
    const vendorTheme = VENDOR_COLORS[dev.vendor] || VENDOR_COLORS['ASUS'];

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="sticky-col">
        <strong style="color:${vendorTheme.fill}">${dev.device_name}</strong>
        <div style="font-size:0.7rem;color:#94a3b8">$${calc.effPrice.toLocaleString()} (${dev.category.includes('unified') ? 'Mac/DGX' : 'Discrete'})</div>
      </td>
      <td class="sticky-col-2">${usableVram} GB</td>
    `;

    models.forEach(m => {
      const fit = calculateModelFit(m, usableVram, bw);
      const td = document.createElement('td');
      td.innerHTML = `
        <div class="badge ${fit.badgeClass}" title="${fit.tooltip}">
          ${fit.badgeText}
        </div>
        ${fit.speed ? `<div style="font-size:0.7rem;font-family:var(--font-mono);color:#38bdf8;margin-top:2px">${fit.speed} tok/s</div>` : ''}
      `;
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  initModelFitExplorers();
}

function calculateModelFit(model, usableVram, bandwidth) {
  const req = model.memory_req_gb || {};
  const filter = state.quantAccuracyFilter;

  if (filter === 'all' || filter === 'fp16') {
    if (usableVram >= req.fp16) {
      const speed = Math.round(bandwidth / (req.fp16 * 0.95));
      return { badgeText: 'FP16 (100%)', badgeClass: 'badge-fit-fp16', speed, tooltip: `Full 16-bit precision. Unsloth: 100% accuracy retention.` };
    }
  }

  if (filter === 'all' || filter === 'q8' || filter === 'q5' || filter === 'q4') {
    if (usableVram >= req.q8_0) {
      const speed = Math.round(bandwidth / (req.q8_0 * 0.95));
      return { badgeText: 'Q8 (99.8%)', badgeClass: 'badge-fit-q8', speed, tooltip: `8-bit quantization. Unsloth: 99.8% accuracy retention.` };
    }
  }

  if (filter === 'all' || filter === 'q5' || filter === 'q4') {
    if (usableVram >= req.q5_k_m) {
      const speed = Math.round(bandwidth / (req.q5_k_m * 0.95));
      return { badgeText: 'Q5 (98.6%)', badgeClass: 'badge-fit-q5', speed, tooltip: `5-bit quantization. Unsloth: 98.6% accuracy retention.` };
    }
  }

  if (filter === 'all' || filter === 'q4') {
    if (usableVram >= req.q4_k_m) {
      const speed = Math.round(bandwidth / (req.q4_k_m * 0.95));
      return { badgeText: 'Q4 (97.4%)', badgeClass: 'badge-fit-q4', speed, tooltip: `4-bit optimal sweet spot. Unsloth: 97.4% accuracy retention.` };
    }
  }

  if (filter === 'all') {
    if (usableVram >= req.q3_k_m) {
      const speed = Math.round(bandwidth / (req.q3_k_m * 0.95));
      return { badgeText: 'Q3 (93.0%)', badgeClass: 'badge-fit-q3', speed, tooltip: `3-bit low VRAM. Unsloth: 93.0% accuracy retention.` };
    }
    if (usableVram >= req.q2_k) {
      const speed = Math.round(bandwidth / (req.q2_k * 0.95));
      return { badgeText: 'Q2 (87.0%)', badgeClass: 'badge-fit-q2', speed, tooltip: `2-bit extreme fit. Unsloth: 87.0% accuracy retention.` };
    }
  }

  return { badgeText: 'Exceeds', badgeClass: 'badge-fit-none', speed: null, tooltip: `Model requires at least ${req.q4_k_m}GB (Q4) / ${req.q2_k}GB (Q2), exceeds ${usableVram}GB usable VRAM.` };
}

function initModelFitExplorers() {
  const selModel = document.getElementById('selExplorerModel');
  const selDev = document.getElementById('selExplorerHardware');

  if (selModel && selModel.children.length === 0) {
    state.rawModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name} (${m.total_params_b}B · ${m.creator})`;
      selModel.appendChild(opt);
    });

    selModel.addEventListener('change', (e) => {
      const mod = state.rawModels.find(m => m.id === e.target.value);
      if (mod) renderModelToHardwareFit(mod);
    });
    if (state.rawModels.length > 0) renderModelToHardwareFit(state.rawModels[0]);
  }

  if (selDev && selDev.children.length === 0) {
    state.rawDevices.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.device_name} (${d.memory_capacity_gb}GB · $${parseFloat(d.price_usd).toLocaleString()})`;
      selDev.appendChild(opt);
    });

    selDev.addEventListener('change', (e) => {
      const d = state.rawDevices.find(dev => dev.id === e.target.value);
      if (d) renderHardwareToModelsFit(d);
    });
    if (state.rawDevices.length > 0) renderHardwareToModelsFit(state.rawDevices[0]);
  }
}

function renderModelToHardwareFit(model) {
  const container = document.getElementById('modelFitResults');
  if (!container) return;

  const req = model.memory_req_gb;
  container.innerHTML = `
    <div style="background:rgba(15,23,42,0.9);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--border-color);margin-bottom:10px">
      <div style="font-size:0.75rem;color:#94a3b8">Unsloth Quantization Memory Footprints:</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
        <span class="badge badge-fit-fp16">FP16: ${req.fp16} GB</span>
        <span class="badge badge-fit-q8">Q8: ${req.q8_0} GB</span>
        <span class="badge badge-fit-q5">Q5: ${req.q5_k_m} GB</span>
        <span class="badge badge-fit-q4">Q4: ${req.q4_k_m} GB</span>
        <span class="badge badge-fit-q3">Q3: ${req.q3_k_m} GB</span>
        <span class="badge badge-fit-q2">Q2: ${req.q2_k} GB</span>
      </div>
    </div>
  `;

  state.rawDevices.forEach(dev => {
    const calc = calculateDeviceScore(dev, 1, false);
    const fit = calculateModelFit(model, calc.effCap, parseFloat(dev.local_memory_bandwidth_gbs) || 1);
    const vendorTheme = VENDOR_COLORS[dev.vendor] || VENDOR_COLORS['ASUS'];

    const item = document.createElement('div');
    item.className = 'fit-result-item';
    item.innerHTML = `
      <div>
        <div class="fit-result-title" style="color:${vendorTheme.fill}">${dev.device_name}</div>
        <div class="fit-result-sub">$${calc.effPrice.toLocaleString()} · ${calc.effCap}GB usable · ${dev.local_memory_bandwidth_gbs} GB/s</div>
      </div>
      <div style="text-align:right">
        <span class="badge ${fit.badgeClass}">${fit.badgeText}</span>
        ${fit.speed ? `<div class="fit-speed-badge" style="margin-top:3px">${fit.speed} tok/s</div>` : ''}
      </div>
    `;
    container.appendChild(item);
  });
}

function renderHardwareToModelsFit(dev) {
  const container = document.getElementById('hardwareFitResults');
  if (!container) return;

  const calc = calculateDeviceScore(dev, 1, false);
  const usableVram = calc.effCap;
  const bw = parseFloat(dev.local_memory_bandwidth_gbs) || 1;

  container.innerHTML = '';
  state.rawModels.forEach(m => {
    const fit = calculateModelFit(m, usableVram, bw);
    const item = document.createElement('div');
    item.className = 'fit-result-item';
    item.innerHTML = `
      <div>
        <div class="fit-result-title">${m.name}</div>
        <div class="fit-result-sub">${m.total_params_b}B params · ${m.category} · ${m.creator}</div>
      </div>
      <div style="text-align:right">
        <span class="badge ${fit.badgeClass}">${fit.badgeText}</span>
        ${fit.speed ? `<div class="fit-speed-badge" style="margin-top:3px">${fit.speed} tok/s</div>` : ''}
      </div>
    `;
    container.appendChild(item);
  });
}

// ================= TAB 3: OPEN MODELS EXPLORER =================
function renderOpenModelsExplorer() {
  const grid = document.getElementById('modelsGrid');
  const txtSearch = document.getElementById('txtSearchModels');
  const lblCount = document.getElementById('lblModelFilterCount');
  if (!grid || state.rawModels.length === 0) return;

  const query = (txtSearch ? txtSearch.value : '').toLowerCase().trim();

  let models = [...state.rawModels];

  // 1. Text Search Filter
  if (query) {
    models = models.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.creator.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      (m.description || '').toLowerCase().includes(query)
    );
  }

  // 2. Release Date Filter
  if (state.modelDateFilter === '2026') {
    models = models.filter(m => (m.release_date || '').startsWith('2026'));
  } else if (state.modelDateFilter === '2025') {
    models = models.filter(m => (m.release_date || '') >= '2025-01-01');
  } else if (state.modelDateFilter === '2024') {
    models = models.filter(m => (m.release_date || '').startsWith('2024'));
  }

  // 3. Min AA Intelligence Index Filter
  if (state.modelMinIQ > 0) {
    models = models.filter(m => (m.intelligence_index || 0) >= state.modelMinIQ);
  }

  // 4. Parameter Size Filter
  if (state.modelSizeFilter === 'compact') {
    models = models.filter(m => m.total_params_b <= 14);
  } else if (state.modelSizeFilter === 'mid') {
    models = models.filter(m => m.total_params_b > 14 && m.total_params_b <= 35);
  } else if (state.modelSizeFilter === 'large') {
    models = models.filter(m => m.total_params_b > 35 && m.total_params_b <= 100);
  } else if (state.modelSizeFilter === 'frontier') {
    models = models.filter(m => m.total_params_b > 100);
  }

  // 5. Creator / Lab Filter
  if (state.modelLabFilter !== 'all') {
    models = models.filter(m => m.creator.toLowerCase().includes(state.modelLabFilter.toLowerCase()));
  }

  // 6. Sorting
  const sortMode = state.modelSort || 'intelligence_desc';
  if (sortMode === 'intelligence_desc') {
    models.sort((a, b) => (b.intelligence_index || 0) - (a.intelligence_index || 0));
  } else if (sortMode === 'date_desc') {
    models.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
  } else if (sortMode === 'math_desc') {
    models.sort((a, b) => (b.aa_math_500 || 0) - (a.aa_math_500 || 0));
  } else if (sortMode === 'code_desc') {
    models.sort((a, b) => (b.aa_coding_humaneval || 0) - (a.aa_coding_humaneval || 0));
  } else if (sortMode === 'speed_desc') {
    models.sort((a, b) => (b.output_speed_tok_s || 0) - (a.output_speed_tok_s || 0));
  } else if (sortMode === 'params_desc') {
    models.sort((a, b) => (b.total_params_b || 0) - (a.total_params_b || 0));
  } else if (sortMode === 'params_asc') {
    models.sort((a, b) => (a.total_params_b || 0) - (b.total_params_b || 0));
  }

  if (lblCount) {
    lblCount.textContent = `Showing ${models.length} of ${state.rawModels.length} Models`;
  }

  grid.innerHTML = '';
  models.forEach(m => {
    const req = m.memory_req_gb || {};
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
      <div class="model-card-top">
        <div>
          <h3 class="model-name">${m.name}</h3>
          <p class="model-creator">
            ${m.creator} · ${m.category}
            ${m.release_date ? `<span class="model-release-badge">📅 ${m.release_date}</span>` : ''}
          </p>
        </div>
        <span class="badge badge-accent">${m.total_params_b}B</span>
      </div>

      <div class="model-benchmark-grid">
        <div class="benchmark-box highlight">
          <span class="benchmark-lbl">AA Intelligence</span>
          <span class="benchmark-val">${m.intelligence_index || '—'}</span>
        </div>
        <div class="benchmark-box">
          <span class="benchmark-lbl">MMLU-Pro</span>
          <span class="benchmark-val">${m.aa_mmlu_pro ? `${m.aa_mmlu_pro}%` : '—'}</span>
        </div>
        <div class="benchmark-box">
          <span class="benchmark-lbl">GPQA Diamond</span>
          <span class="benchmark-val">${m.aa_gpqa ? `${m.aa_gpqa}%` : '—'}</span>
        </div>
        <div class="benchmark-box">
          <span class="benchmark-lbl">MATH 500</span>
          <span class="benchmark-val">${m.aa_math_500 ? `${m.aa_math_500}%` : '—'}</span>
        </div>
        <div class="benchmark-box">
          <span class="benchmark-lbl">HumanEval Code</span>
          <span class="benchmark-val">${m.aa_coding_humaneval ? `${m.aa_coding_humaneval}%` : '—'}</span>
        </div>
        <div class="benchmark-box">
          <span class="benchmark-lbl">Speed / Context</span>
          <span class="benchmark-val">${m.output_speed_tok_s ? `${m.output_speed_tok_s} t/s` : '—'} · ${m.context_window_str || '128k'}</span>
        </div>
      </div>

      <p class="model-desc">${m.description || ''}</p>

      <div style="font-size:0.72rem;color:#94a3b8;margin-top:4px;font-family:var(--font-mono)">Unsloth VRAM Requirements & Accuracy:</div>
      <div class="model-quant-mem-pills">
        <span class="quant-pill">FP16: <strong>${req.fp16 || '—'}GB</strong> (100%)</span>
        <span class="quant-pill">Q8: <strong>${req.q8_0 || '—'}GB</strong> (99.8%)</span>
        <span class="quant-pill">Q6: <strong>${req.q6_k || '—'}GB</strong> (99.2%)</span>
        <span class="quant-pill">Q5: <strong>${req.q5_k_m || '—'}GB</strong> (98.6%)</span>
        <span class="quant-pill">Q4: <strong>${req.q4_k_m || '—'}GB</strong> (97.4%)</span>
        <span class="quant-pill">Q3: <strong>${req.q3_k_m || '—'}GB</strong> (93%)</span>
        <span class="quant-pill">Q2: <strong>${req.q2_k || '—'}GB</strong> (87%)</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ================= TAB 4: TASK ECONOMICS & TCO =================
function renderTaskEconomics() {
  const tbody = document.getElementById('tblTaskEconomicsBody');
  const summaryContainer = document.getElementById('breakEvenSummaryList');
  if (!tbody || state.rawDevices.length === 0) return;

  const baseline = CLOUD_API_PRICING[state.cloudApiBaseline] || CLOUD_API_PRICING['gpt-4o'];
  const dailyM = state.dailyTokens / 1000000.0;
  const dailyCloudCost = dailyM * baseline.costPer1MTok;

  tbody.innerHTML = '';
  if (summaryContainer) summaryContainer.innerHTML = '';

  const recommendations = [];

  state.rawDevices.forEach(dev => {
    if (!state.allowedVendors.has(dev.vendor)) return;
    if (!state.includeModded && (dev.modified || 'no').toLowerCase() === 'yes') return;
    if (!state.includeDatacenter && parseFloat(dev.price_usd) > 50000) return;

    const calc = calculateDeviceScore(dev, 1, false);
    const vendorTheme = VENDOR_COLORS[dev.vendor] || VENDOR_COLORS['ASUS'];

    // Daily local electricity cost
    const powerKw = dev.category.includes('unified') ? 0.12 : 0.35;
    const hoursPerDayAtSpeed = Math.min(24.0, (state.dailyTokens / (Math.max(1, calc.peakSpeed) * 3600)));
    const dailyElectricity = hoursPerDayAtSpeed * powerKw * 0.15;

    // Break-even days
    const dailySavings = dailyCloudCost - dailyElectricity;
    const breakEvenDays = dailySavings > 0 ? Math.round(calc.effPrice / dailySavings) : 9999;
    const threeYearNetSavings = Math.round((dailySavings * 365 * 3) - calc.effPrice);

    recommendations.push({
      device: dev,
      calc,
      breakEvenDays,
      threeYearNetSavings,
      vendorTheme
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color:${vendorTheme.fill}">${dev.device_name}</strong>
        <div style="font-size:0.68rem;color:#728aa3;font-family:var(--font-mono)">${dev.vendor} (${dev.category})</div>
      </td>
      <td style="font-family:var(--font-mono)">$${calc.effPrice.toLocaleString()}</td>
      <td style="color:#00f0ff;font-family:var(--font-mono)">${calc.peakModel}</td>
      <td style="font-family:var(--font-mono)">${calc.peakSpeed} tok/s</td>
      <td style="font-family:var(--font-mono);color:#00ff66"><strong>$${calc.costPer1kTasks}</strong></td>
      <td style="font-family:var(--font-mono);color:#ff2a55">$${Math.round(dailyCloudCost * 100) / 100}/day</td>
      <td style="font-family:var(--font-mono);color:#ffd700"><strong>${breakEvenDays < 1000 ? `${breakEvenDays} days` : 'N/A'}</strong></td>
      <td style="font-family:var(--font-mono);color:${threeYearNetSavings > 0 ? '#00ff66' : '#728aa3'}">
        ${threeYearNetSavings > 0 ? `+$${threeYearNetSavings.toLocaleString()}` : `-$${Math.abs(threeYearNetSavings).toLocaleString()}`}
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render Top Recommendations in Summary Card
  if (summaryContainer) {
    recommendations.sort((a, b) => a.breakEvenDays - b.breakEvenDays);
    recommendations.slice(0, 3).forEach(rec => {
      const item = document.createElement('div');
      item.className = 'fit-result-item';
      item.innerHTML = `
        <div>
          <div class="fit-result-title" style="color:${rec.vendorTheme.fill}">${rec.device.device_name}</div>
          <div class="fit-result-sub">${rec.calc.peakModel} · TCO $${rec.calc.effPrice.toLocaleString()}</div>
        </div>
        <div style="text-align:right">
          <span class="badge badge-fit-fp16">Break-even: ${rec.breakEvenDays} days</span>
          <div style="font-size:0.7rem;color:#00ff66;font-family:var(--font-mono);margin-top:2px">3-Yr ROI: +$${rec.threeYearNetSavings.toLocaleString()}</div>
        </div>
      `;
      summaryContainer.appendChild(item);
    });
  }
}

// ================= TAB 5: DEVICE DATABASE & TCO =================
function renderDeviceTable() {
  const tbody = document.getElementById('tblHardwareDevicesBody');
  const txtSearch = document.getElementById('txtSearchDevices');
  if (!tbody || state.rawDevices.length === 0) return;

  const query = (txtSearch ? txtSearch.value : '').toLowerCase().trim();

  let devices = [...state.rawDevices];

  // 1. Text Search Filter
  if (query) {
    devices = devices.filter(d => 
      d.device_name.toLowerCase().includes(query) ||
      d.vendor.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query) ||
      (d.caveats || '').toLowerCase().includes(query)
    );
  }

  // 2. Vendor Filter
  if (state.deviceVendorFilter && state.deviceVendorFilter !== 'all') {
    devices = devices.filter(d => d.vendor === state.deviceVendorFilter);
  }

  // 3. Price Filter
  if (state.devicePriceFilter === 'under1k') devices = devices.filter(d => parseFloat(d.price_usd) < 1000);
  else if (state.devicePriceFilter === '1k-3k') devices = devices.filter(d => parseFloat(d.price_usd) >= 1000 && parseFloat(d.price_usd) <= 3000);
  else if (state.devicePriceFilter === '3k-10k') devices = devices.filter(d => parseFloat(d.price_usd) > 3000 && parseFloat(d.price_usd) <= 10000);
  else if (state.devicePriceFilter === '10k-50k') devices = devices.filter(d => parseFloat(d.price_usd) > 10000 && parseFloat(d.price_usd) <= 50000);
  else if (state.devicePriceFilter === 'datacenter') devices = devices.filter(d => parseFloat(d.price_usd) > 50000);

  // 4. VRAM Filter
  if (state.deviceVramFilter === '12') devices = devices.filter(d => parseFloat(d.memory_capacity_gb) >= 12);
  else if (state.deviceVramFilter === '16') devices = devices.filter(d => parseFloat(d.memory_capacity_gb) >= 16);
  else if (state.deviceVramFilter === '24') devices = devices.filter(d => parseFloat(d.memory_capacity_gb) >= 24);
  else if (state.deviceVramFilter === '48') devices = devices.filter(d => parseFloat(d.memory_capacity_gb) >= 48);
  else if (state.deviceVramFilter === '64') devices = devices.filter(d => parseFloat(d.memory_capacity_gb) >= 64);
  else if (state.deviceVramFilter === '128') devices = devices.filter(d => parseFloat(d.memory_capacity_gb) >= 128);

  tbody.innerHTML = '';
  devices.forEach(dev => {
    const calc = calculateDeviceScore(dev, 1, false);
    const pt = state.processedPoints.find(p => p.baseId === dev.id && p.multiplier === 1);
    const isPareto = pt ? pt.isPareto : false;
    const vendorTheme = VENDOR_COLORS[dev.vendor] || VENDOR_COLORS['ASUS'];

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color:${vendorTheme.fill}">${dev.device_name}</strong></td>
      <td><span class="badge badge-${dev.vendor.toLowerCase()}">${dev.vendor}</span></td>
      <td><span class="badge ${dev.category.includes('unified') ? 'badge-accent' : 'badge-subtle'}">${dev.category}</span></td>
      <td style="font-family:var(--font-mono)">$${parseFloat(dev.price_usd).toLocaleString()}</td>
      <td style="font-family:var(--font-mono);color:#00f0ff"><strong>$${calc.effPrice.toLocaleString()}</strong></td>
      <td style="font-family:var(--font-mono)">${dev.memory_capacity_gb} GB</td>
      <td style="font-family:var(--font-mono);color:#00ff66">${calc.effCap} GB</td>
      <td style="font-family:var(--font-mono)">${dev.local_memory_bandwidth_gbs} GB/s</td>
      <td style="font-family:var(--font-mono)">${dev.fp16_tflops || '—'}</td>
      <td style="font-size:0.72rem;color:#728aa3;font-family:var(--font-mono)">${dev.nvlink === 'yes' ? 'NVLink' : (dev.thunderbolt5 === 'yes' ? 'TB5' : (dev.connectx7 === 'yes' ? 'ConnectX-7' : 'PCIe'))}</td>
      <td style="font-family:var(--font-mono);font-weight:700;color:#ffd700">${calc.activeY.toLocaleString()}</td>
      <td>${isPareto ? '<span class="badge badge-fit-fp16">★ Pareto</span>' : '<span style="color:#566c82">—</span>'}</td>
    `;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      const plotTab = document.querySelector('[data-tab="hardware-plot"]');
      if (plotTab) plotTab.click();
      selectDevice(dev.id);
    });
    tbody.appendChild(tr);
  });
}