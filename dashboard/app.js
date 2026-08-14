/**
 * Local-AI Hardware Value & Model Fit Dashboard
 * Enhanced with Interactive Zoom & Pan, Adaptive Decluttered Annotations,
 * and Unsloth Quantization Accuracy Loss & Fit Matrix.
 */

// Global Application State
const state = {
  rawDevices: [],
  rawModels: [],
  filteredDevices: [],
  processedPoints: [],
  selectedDeviceId: null,
  
  // Display & Parallelism Settings
  chartMode: 'singles', // 'singles' | 'capacity' | 'tp-ceiling'
  
  // System Context & Host Overhead Settings (USER REQUEST)
  useSystemContext: true,
  hostCostUsd: 650,
  macOsOverheadGb: 8,
  
  // Multi-Factor Weighted Scoring Settings
  weightMem: 1.0,
  weightBw: 1.0,
  weightFlops: 0.3,
  cudaBoost: 1.25,
  tpEfficiency: 0.85,
  
  // Chart Settings & Zoom/Pan State
  isLogScale: true,
  includeModded: true,
  includeDatacenter: true,
  allowedVendors: new Set(['NVIDIA', 'Apple', 'AMD', 'ASUS']),
  
  // Zoom & Pan
  zoomScale: 1.0,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  labelMode: 'auto', // 'auto' | 'pareto' | 'all' | 'none'
  
  // Model Fit Matrix Settings
  matrixContextTokens: 8192,
  modelClassFilter: 'all',
  quantAccuracyFilter: 'all',
  selectedExplorerModelId: null,
  selectedExplorerHardwareId: null
};

// Preset Multi-Factor Weight Configurations
const PRESETS = {
  'memory-heavy': { wMem: 1.0, wBw: 1.0, wFlops: 0.3, cuda: 1.25, name: 'LLM Memory-First' },
  'balanced':     { wMem: 0.8, wBw: 0.8, wFlops: 0.6, cuda: 1.20, name: 'Balanced Value' },
  'throughput':   { wMem: 0.5, wBw: 1.2, wFlops: 1.0, cuda: 1.30, name: 'High-Throughput' },
  'legacy':       { wMem: 1.0, wBw: 1.0, wFlops: 0.0, cuda: 1.00, name: 'Legacy C × B' }
};

// Unsloth Quantization Accuracy Retention Reference Table
const UNSLOTH_INFO = {
  fp16:  { label: 'FP16 / BF16', acc: '100%', ppl: '+0.00', quality: 'Full baseline (Zero loss)' },
  q8_0:  { label: 'Q8 / FP8',    acc: '99.8%', ppl: '+0.02', quality: 'Near-lossless (99.8% acc)' },
  q6_k:  { label: 'Q6_K',        acc: '99.3%', ppl: '+0.04', quality: 'High quality (99.3% acc)' },
  q5_k_m:{ label: 'Q5_K_M',      acc: '98.6%', ppl: '+0.09', quality: 'Sweet spot <14B (98.6% acc)' },
  q4_k_m:{ label: 'Q4_K_M',      acc: '97.4%', ppl: '+0.18', quality: 'Unsloth standard (97.4% acc)' },
  q3_k_m:{ label: 'Q3_K_M',      acc: '93.0%', ppl: '+0.48', quality: 'Low VRAM (93% acc on 70B+)' },
  q2_k:  { label: 'Q2_K',        acc: '87.0%', ppl: '+1.15', quality: 'Extreme MoE fit (87% acc)' }
};

// ================= INITIALIZATION & DATA FETCHING =================
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initControlListeners();
  initZoomPanListeners();
  await loadData();
  recalculateAndRender();
});


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
    "id": "deepseek_v4_pro",
    "name": "DeepSeek V4 Pro 0813 (max)",
    "creator": "DeepSeek",
    "category": "MoE",
    "total_params_b": 1600.0,
    "active_params_b": 49.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 53.2,
    "briefcase_elo": 1610,
    "output_speed_tok_s": 80.0,
    "latency_ttft_s": 0.85,
    "openness_index": 85.0,
    "license": "DeepSeek Open License",
    "description": "Ultra-scale flagship mixture-of-experts model with 49B active parameters per token.",
    "memory_req_gb": {
      "fp16": 3485.6,
      "q8_0": 1855.5,
      "q6_k": 1442.5,
      "q5_k_m": 1203.4,
      "q4_k_m": 986.1,
      "q3_k_m": 747.0,
      "q2_k": 551.4
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "deepseek_v4_flash",
    "name": "DeepSeek V4 Flash 0731 (max)",
    "creator": "DeepSeek",
    "category": "MoE",
    "total_params_b": 671.0,
    "active_params_b": 37.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 52.0,
    "briefcase_elo": 1585,
    "output_speed_tok_s": 120.0,
    "latency_ttft_s": 0.62,
    "openness_index": 85.0,
    "license": "DeepSeek Open License",
    "description": "High-speed reasoning MoE model with exceptional performance per active parameter.",
    "memory_req_gb": {
      "fp16": 1466.4,
      "q8_0": 782.8,
      "q6_k": 609.6,
      "q5_k_m": 509.3,
      "q4_k_m": 418.2,
      "q3_k_m": 317.9,
      "q2_k": 235.9
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "deepseek_r1_671b",
    "name": "DeepSeek R1 (671B MoE)",
    "creator": "DeepSeek",
    "category": "MoE",
    "total_params_b": 671.0,
    "active_params_b": 37.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 50.8,
    "briefcase_elo": 1565,
    "output_speed_tok_s": 95.0,
    "latency_ttft_s": 0.72,
    "openness_index": 88.0,
    "license": "MIT",
    "description": "Groundbreaking open-weights reasoning model with 671B total params and 37B active per token.",
    "memory_req_gb": {
      "fp16": 1466.4,
      "q8_0": 782.8,
      "q6_k": 609.6,
      "q5_k_m": 509.3,
      "q4_k_m": 418.2,
      "q3_k_m": 317.9,
      "q2_k": 235.9
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "deepseek_v3_671b",
    "name": "DeepSeek V3 (671B MoE)",
    "creator": "DeepSeek",
    "category": "MoE",
    "total_params_b": 671.0,
    "active_params_b": 37.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 49.6,
    "briefcase_elo": 1545,
    "output_speed_tok_s": 100.0,
    "latency_ttft_s": 0.68,
    "openness_index": 88.0,
    "license": "MIT",
    "description": "Frontier general-purpose 671B MoE model offering GPT-4o class performance.",
    "memory_req_gb": {
      "fp16": 1466.4,
      "q8_0": 782.8,
      "q6_k": 609.6,
      "q5_k_m": 509.3,
      "q4_k_m": 418.2,
      "q3_k_m": 317.9,
      "q2_k": 235.9
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "deepseek_r1_distill_70b",
    "name": "DeepSeek R1 Distill Llama 70B",
    "creator": "DeepSeek / Meta",
    "category": "Dense",
    "total_params_b": 70.6,
    "active_params_b": 70.6,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 48.7,
    "briefcase_elo": 1520,
    "output_speed_tok_s": 72.0,
    "latency_ttft_s": 0.56,
    "openness_index": 86.0,
    "license": "Llama 3.3 License",
    "description": "Llama 70B fine-tuned with DeepSeek R1 reasoning traces, state-of-the-art math and code.",
    "memory_req_gb": {
      "fp16": 156.1,
      "q8_0": 84.2,
      "q6_k": 66.0,
      "q5_k_m": 55.4,
      "q4_k_m": 45.8,
      "q3_k_m": 35.3,
      "q2_k": 26.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.4,
      "q4_k_m": 98.2,
      "q3_k_m": 93.8,
      "q2_k": 87.8
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "deepseek_r1_distill_32b",
    "name": "DeepSeek R1 Distill Qwen 32B",
    "creator": "DeepSeek / Alibaba",
    "category": "Dense",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 45.8,
    "briefcase_elo": 1485,
    "output_speed_tok_s": 90.0,
    "latency_ttft_s": 0.4,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "Distilled 32B model punching far above its weight class in competitive programming and logic.",
    "memory_req_gb": {
      "fp16": 72.5,
      "q8_0": 39.4,
      "q6_k": 31.0,
      "q5_k_m": 26.1,
      "q4_k_m": 21.7,
      "q3_k_m": 16.8,
      "q2_k": 13.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "deepseek_r1_distill_8b",
    "name": "DeepSeek R1 Distill Llama 8B",
    "creator": "DeepSeek / Meta",
    "category": "Dense",
    "total_params_b": 8.03,
    "active_params_b": 8.03,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 37.8,
    "briefcase_elo": 1365,
    "output_speed_tok_s": 160.0,
    "latency_ttft_s": 0.29,
    "openness_index": 86.0,
    "license": "Llama 3.1 License",
    "description": "High-speed 8B reasoning model with distilled step-by-step thinking capability.",
    "memory_req_gb": {
      "fp16": 18.4,
      "q8_0": 10.4,
      "q6_k": 8.4,
      "q5_k_m": 7.2,
      "q4_k_m": 6.1,
      "q3_k_m": 5.0,
      "q2_k": 4.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_4_scout",
    "name": "Llama 4 Scout (109B 10M)",
    "creator": "Meta",
    "category": "Dense",
    "total_params_b": 109.0,
    "active_params_b": 109.0,
    "context_window_tokens": 10485760,
    "context_window_str": "10M",
    "intelligence_index": 54.5,
    "briefcase_elo": 1625,
    "output_speed_tok_s": 68.0,
    "latency_ttft_s": 0.78,
    "openness_index": 82.0,
    "license": "Llama Community License",
    "description": "Meta's next-generation open weights architecture featuring a 10M token context window.",
    "memory_req_gb": {
      "fp16": 240.3,
      "q8_0": 129.2,
      "q6_k": 101.1,
      "q5_k_m": 84.8,
      "q4_k_m": 70.0,
      "q3_k_m": 53.7,
      "q2_k": 40.4
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.8,
      "q4_k_m": 98.6,
      "q3_k_m": 94.2,
      "q2_k": 88.2
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_3_3_70b",
    "name": "Llama 3.3 70B Instruct",
    "creator": "Meta",
    "category": "Dense",
    "total_params_b": 70.6,
    "active_params_b": 70.6,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 48.4,
    "briefcase_elo": 1510,
    "output_speed_tok_s": 75.0,
    "latency_ttft_s": 0.54,
    "openness_index": 84.0,
    "license": "Llama 3.3 Community License",
    "description": "The gold standard open-weights workhorse model, delivering 405B-class performance in 70B.",
    "memory_req_gb": {
      "fp16": 156.1,
      "q8_0": 84.2,
      "q6_k": 66.0,
      "q5_k_m": 55.4,
      "q4_k_m": 45.8,
      "q3_k_m": 35.3,
      "q2_k": 26.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.4,
      "q4_k_m": 98.2,
      "q3_k_m": 93.8,
      "q2_k": 87.8
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_3_1_405b",
    "name": "Llama 3.1 405B Instruct",
    "creator": "Meta",
    "category": "Dense",
    "total_params_b": 405.0,
    "active_params_b": 405.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 52.1,
    "briefcase_elo": 1572,
    "output_speed_tok_s": 32.0,
    "latency_ttft_s": 1.25,
    "openness_index": 84.0,
    "license": "Llama 3.1 Community License",
    "description": "Meta's flagship dense foundation model, state-of-the-art open-weights frontier intelligence.",
    "memory_req_gb": {
      "fp16": 886.7,
      "q8_0": 474.1,
      "q6_k": 369.6,
      "q5_k_m": 309.0,
      "q4_k_m": 254.0,
      "q3_k_m": 193.5,
      "q2_k": 144.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_3_1_8b",
    "name": "Llama 3.1 8B Instruct",
    "creator": "Meta",
    "category": "Dense",
    "total_params_b": 8.03,
    "active_params_b": 8.03,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 35.2,
    "briefcase_elo": 1320,
    "output_speed_tok_s": 165.0,
    "latency_ttft_s": 0.28,
    "openness_index": 84.0,
    "license": "Llama 3.1 Community License",
    "description": "High-efficiency 8B parameter model ideal for single consumer GPUs.",
    "memory_req_gb": {
      "fp16": 18.4,
      "q8_0": 10.4,
      "q6_k": 8.4,
      "q5_k_m": 7.2,
      "q4_k_m": 6.1,
      "q3_k_m": 5.0,
      "q2_k": 4.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_3_2_3b",
    "name": "Llama 3.2 3B Instruct",
    "creator": "Meta",
    "category": "Dense",
    "total_params_b": 3.21,
    "active_params_b": 3.21,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 29.5,
    "briefcase_elo": 1240,
    "output_speed_tok_s": 220.0,
    "latency_ttft_s": 0.18,
    "openness_index": 84.0,
    "license": "Llama 3.2 Community License",
    "description": "Ultra-lightweight edge model running smoothly on entry-level GPUs, laptops, and mobile.",
    "memory_req_gb": {
      "fp16": 8.0,
      "q8_0": 4.9,
      "q6_k": 4.1,
      "q5_k_m": 3.6,
      "q4_k_m": 3.2,
      "q3_k_m": 2.7,
      "q2_k": 2.4
    },
    "quant_accuracy_pct": {
      "fp16": 97.8,
      "q8_0": 97.6,
      "q6_k": 97.1,
      "q5_k_m": 96.4,
      "q4_k_m": 95.2,
      "q3_k_m": 90.8,
      "q2_k": 84.8
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_3_2_1b",
    "name": "Llama 3.2 1B Instruct",
    "creator": "Meta",
    "category": "Dense",
    "total_params_b": 1.23,
    "active_params_b": 1.23,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 24.2,
    "briefcase_elo": 1180,
    "output_speed_tok_s": 310.0,
    "latency_ttft_s": 0.14,
    "openness_index": 84.0,
    "license": "Llama 3.2 Community License",
    "description": "Ultra-fast 1B model delivering instant responses at low memory footprint (<2GB VRAM).",
    "memory_req_gb": {
      "fp16": 3.9,
      "q8_0": 2.7,
      "q6_k": 2.4,
      "q5_k_m": 2.2,
      "q4_k_m": 2.0,
      "q3_k_m": 1.8,
      "q2_k": 1.7
    },
    "quant_accuracy_pct": {
      "fp16": 94.1,
      "q8_0": 93.9,
      "q6_k": 93.4,
      "q5_k_m": 92.7,
      "q4_k_m": 91.5,
      "q3_k_m": 87.1,
      "q2_k": 81.1
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "qwen_3_8_max",
    "name": "Qwen3.8 Max (2.4T A95B)",
    "creator": "Alibaba",
    "category": "MoE",
    "total_params_b": 2400.0,
    "active_params_b": 95.0,
    "context_window_tokens": 1000000,
    "context_window_str": "1M",
    "intelligence_index": 58.0,
    "briefcase_elo": 1655,
    "output_speed_tok_s": 47.0,
    "latency_ttft_s": 2.63,
    "openness_index": 80.0,
    "license": "Qwen Open License",
    "description": "Alibaba's frontier open-weights MoE model with multi-lingual superiority and 95B active compute.",
    "memory_req_gb": {
      "fp16": 5224.4,
      "q8_0": 2779.2,
      "q6_k": 2159.8,
      "q5_k_m": 1801.1,
      "q4_k_m": 1475.1,
      "q3_k_m": 1116.5,
      "q2_k": 823.1
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "qwen_2_5_72b",
    "name": "Qwen 2.5 72B Instruct",
    "creator": "Alibaba",
    "category": "Dense",
    "total_params_b": 72.7,
    "active_params_b": 72.7,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 48.9,
    "briefcase_elo": 1525,
    "output_speed_tok_s": 68.0,
    "latency_ttft_s": 0.58,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "Industry-leading dense open-weights model for coding, mathematics, and complex reasoning.",
    "memory_req_gb": {
      "fp16": 160.7,
      "q8_0": 86.7,
      "q6_k": 67.9,
      "q5_k_m": 57.0,
      "q4_k_m": 47.2,
      "q3_k_m": 36.3,
      "q2_k": 27.4
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.4,
      "q4_k_m": 98.2,
      "q3_k_m": 93.8,
      "q2_k": 87.8
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "qwen_2_5_coder_32b",
    "name": "Qwen 2.5 Coder 32B Instruct",
    "creator": "Alibaba",
    "category": "Dense",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 46.5,
    "briefcase_elo": 1495,
    "output_speed_tok_s": 92.0,
    "latency_ttft_s": 0.38,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "Top-tier open-source coding model rivaling GPT-4o on HumanEval and SWE-bench.",
    "memory_req_gb": {
      "fp16": 72.5,
      "q8_0": 39.4,
      "q6_k": 31.0,
      "q5_k_m": 26.1,
      "q4_k_m": 21.7,
      "q3_k_m": 16.8,
      "q2_k": 13.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "qwen_2_5_32b",
    "name": "Qwen 2.5 32B Instruct",
    "creator": "Alibaba",
    "category": "Dense",
    "total_params_b": 32.5,
    "active_params_b": 32.5,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 44.3,
    "briefcase_elo": 1460,
    "output_speed_tok_s": 95.0,
    "latency_ttft_s": 0.38,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "Sweet-spot 32B dense model that fits into single 24GB GPUs at 4-bit/5-bit quantization.",
    "memory_req_gb": {
      "fp16": 72.5,
      "q8_0": 39.4,
      "q6_k": 31.0,
      "q5_k_m": 26.1,
      "q4_k_m": 21.7,
      "q3_k_m": 16.8,
      "q2_k": 13.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "qwen_2_5_14b",
    "name": "Qwen 2.5 14B Instruct",
    "creator": "Alibaba",
    "category": "Dense",
    "total_params_b": 14.7,
    "active_params_b": 14.7,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 39.8,
    "briefcase_elo": 1390,
    "output_speed_tok_s": 130.0,
    "latency_ttft_s": 0.32,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "High-efficiency 14B model that runs unquantized or at 8-bit on sub-$1000 hardware.",
    "memory_req_gb": {
      "fp16": 33.2,
      "q8_0": 18.2,
      "q6_k": 14.5,
      "q5_k_m": 12.3,
      "q4_k_m": 10.4,
      "q3_k_m": 8.3,
      "q2_k": 6.6
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "qwen_2_5_7b",
    "name": "Qwen 2.5 7B Instruct",
    "creator": "Alibaba",
    "category": "Dense",
    "total_params_b": 7.61,
    "active_params_b": 7.61,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 34.6,
    "briefcase_elo": 1305,
    "output_speed_tok_s": 180.0,
    "latency_ttft_s": 0.24,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "Ultra-fast compact model with standout performance in coding and multi-language comprehension.",
    "memory_req_gb": {
      "fp16": 17.4,
      "q8_0": 9.9,
      "q6_k": 8.0,
      "q5_k_m": 6.9,
      "q4_k_m": 5.9,
      "q3_k_m": 4.8,
      "q2_k": 3.9
    },
    "quant_accuracy_pct": {
      "fp16": 99.0,
      "q8_0": 98.8,
      "q6_k": 98.3,
      "q5_k_m": 97.6,
      "q4_k_m": 96.4,
      "q3_k_m": 92.0,
      "q2_k": 86.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "gemma_4_31b",
    "name": "Gemma 4 31B Instruct",
    "creator": "Google",
    "category": "Dense",
    "total_params_b": 31.2,
    "active_params_b": 31.2,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 45.1,
    "briefcase_elo": 1480,
    "output_speed_tok_s": 98.0,
    "latency_ttft_s": 0.36,
    "openness_index": 86.0,
    "license": "Gemma Terms of Use",
    "description": "Google's latest open weights architecture with enhanced multi-step logic and instruction following.",
    "memory_req_gb": {
      "fp16": 69.6,
      "q8_0": 37.8,
      "q6_k": 29.8,
      "q5_k_m": 25.1,
      "q4_k_m": 20.9,
      "q3_k_m": 16.2,
      "q2_k": 12.5
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "gemma_3_27b",
    "name": "Gemma 3 27B Instruct",
    "creator": "Google",
    "category": "Dense",
    "total_params_b": 27.2,
    "active_params_b": 27.2,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 43.0,
    "briefcase_elo": 1450,
    "output_speed_tok_s": 105.0,
    "latency_ttft_s": 0.34,
    "openness_index": 86.0,
    "license": "Gemma Terms of Use",
    "description": "High-density 27B model offering remarkable reasoning per gigabyte of VRAM.",
    "memory_req_gb": {
      "fp16": 60.8,
      "q8_0": 33.1,
      "q6_k": 26.1,
      "q5_k_m": 22.0,
      "q4_k_m": 18.3,
      "q3_k_m": 14.3,
      "q2_k": 11.1
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "gemma_3_12b",
    "name": "Gemma 3 12B Instruct",
    "creator": "Google",
    "category": "Dense",
    "total_params_b": 12.1,
    "active_params_b": 12.1,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 38.2,
    "briefcase_elo": 1370,
    "output_speed_tok_s": 140.0,
    "latency_ttft_s": 0.28,
    "openness_index": 86.0,
    "license": "Gemma Terms of Use",
    "description": "Balanced 12B model that runs at high speeds on single 16GB GPUs.",
    "memory_req_gb": {
      "fp16": 27.4,
      "q8_0": 15.1,
      "q6_k": 12.1,
      "q5_k_m": 10.3,
      "q4_k_m": 8.8,
      "q3_k_m": 7.0,
      "q2_k": 5.6
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "gemma_3_4b",
    "name": "Gemma 3 4B Instruct",
    "creator": "Google",
    "category": "Dense",
    "total_params_b": 4.15,
    "active_params_b": 4.15,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 31.0,
    "briefcase_elo": 1260,
    "output_speed_tok_s": 210.0,
    "latency_ttft_s": 0.2,
    "openness_index": 86.0,
    "license": "Gemma Terms of Use",
    "description": "Compact Google model tailored for rapid local tool execution and summaries.",
    "memory_req_gb": {
      "fp16": 10.0,
      "q8_0": 5.9,
      "q6_k": 4.9,
      "q5_k_m": 4.3,
      "q4_k_m": 3.8,
      "q3_k_m": 3.2,
      "q2_k": 2.7
    },
    "quant_accuracy_pct": {
      "fp16": 98.3,
      "q8_0": 98.1,
      "q6_k": 97.6,
      "q5_k_m": 96.9,
      "q4_k_m": 95.7,
      "q3_k_m": 91.3,
      "q2_k": 85.3
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "gemma_2_27b",
    "name": "Gemma 2 27B Instruct",
    "creator": "Google",
    "category": "Dense",
    "total_params_b": 27.2,
    "active_params_b": 27.2,
    "context_window_tokens": 8192,
    "context_window_str": "8k",
    "intelligence_index": 42.1,
    "briefcase_elo": 1430,
    "output_speed_tok_s": 108.0,
    "latency_ttft_s": 0.35,
    "openness_index": 86.0,
    "license": "Gemma Terms of Use",
    "description": "Google's 27B architecture with sliding-window attention and logit capping.",
    "memory_req_gb": {
      "fp16": 60.8,
      "q8_0": 33.1,
      "q6_k": 26.1,
      "q5_k_m": 22.0,
      "q4_k_m": 18.3,
      "q3_k_m": 14.3,
      "q2_k": 11.1
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "gemma_2_9b",
    "name": "Gemma 2 9B Instruct",
    "creator": "Google",
    "category": "Dense",
    "total_params_b": 9.24,
    "active_params_b": 9.24,
    "context_window_tokens": 8192,
    "context_window_str": "8k",
    "intelligence_index": 36.5,
    "briefcase_elo": 1340,
    "output_speed_tok_s": 150.0,
    "latency_ttft_s": 0.26,
    "openness_index": 86.0,
    "license": "Gemma Terms of Use",
    "description": "Compact 9B model matching early 70B models on many core benchmarks.",
    "memory_req_gb": {
      "fp16": 21.1,
      "q8_0": 11.8,
      "q6_k": 9.5,
      "q5_k_m": 8.1,
      "q4_k_m": 6.9,
      "q3_k_m": 5.6,
      "q2_k": 4.5
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "muse_glimmer",
    "name": "Muse Glimmer (30B)",
    "creator": "Meta / Muse",
    "category": "Dense",
    "total_params_b": 30.0,
    "active_params_b": 30.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 46.8,
    "briefcase_elo": 1490,
    "output_speed_tok_s": 88.0,
    "latency_ttft_s": 0.42,
    "openness_index": 82.0,
    "license": "Open Weights",
    "description": "High-reasoning 30B model with deep reasoning tokens and 1M context length.",
    "memory_req_gb": {
      "fp16": 67.0,
      "q8_0": 36.4,
      "q6_k": 28.6,
      "q5_k_m": 24.2,
      "q4_k_m": 20.1,
      "q3_k_m": 15.6,
      "q2_k": 12.1
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "muse_spark_1_2",
    "name": "Muse Spark 1.2 (109B)",
    "creator": "Meta / Muse",
    "category": "Dense",
    "total_params_b": 109.0,
    "active_params_b": 109.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 57.0,
    "briefcase_elo": 1640,
    "output_speed_tok_s": 55.0,
    "latency_ttft_s": 0.7,
    "openness_index": 82.0,
    "license": "Open Weights",
    "description": "Frontier open model delivering top-tier intelligence with reasoning chains.",
    "memory_req_gb": {
      "fp16": 240.3,
      "q8_0": 129.2,
      "q6_k": 101.1,
      "q5_k_m": 84.8,
      "q4_k_m": 70.0,
      "q3_k_m": 53.7,
      "q2_k": 40.4
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.8,
      "q4_k_m": 98.6,
      "q3_k_m": 94.2,
      "q2_k": 88.2
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "mistral_medium_3_5",
    "name": "Mistral Medium 3.5 (128B)",
    "creator": "Mistral AI",
    "category": "Dense",
    "total_params_b": 128.0,
    "active_params_b": 128.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 49.5,
    "briefcase_elo": 1540,
    "output_speed_tok_s": 58.0,
    "latency_ttft_s": 0.69,
    "openness_index": 81.0,
    "license": "Apache 2.0",
    "description": "High-capability European foundation model with top-tier reasoning and multilingual dexterity.",
    "memory_req_gb": {
      "fp16": 281.8,
      "q8_0": 151.4,
      "q6_k": 118.4,
      "q5_k_m": 99.3,
      "q4_k_m": 81.9,
      "q3_k_m": 62.7,
      "q2_k": 47.1
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 98.9,
      "q3_k_m": 94.5,
      "q2_k": 88.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "mistral_large_2",
    "name": "Mistral Large 2 (123B)",
    "creator": "Mistral AI",
    "category": "Dense",
    "total_params_b": 123.0,
    "active_params_b": 123.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 48.0,
    "briefcase_elo": 1515,
    "output_speed_tok_s": 62.0,
    "latency_ttft_s": 0.65,
    "openness_index": 80.0,
    "license": "Mistral Research License",
    "description": "123B parameter frontier dense model built for enterprise reasoning and code generation.",
    "memory_req_gb": {
      "fp16": 270.9,
      "q8_0": 145.6,
      "q6_k": 113.8,
      "q5_k_m": 95.4,
      "q4_k_m": 78.7,
      "q3_k_m": 60.4,
      "q2_k": 45.3
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 98.8,
      "q3_k_m": 94.4,
      "q2_k": 88.4
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "mixtral_8x22b",
    "name": "Mixtral 8x22B Instruct",
    "creator": "Mistral AI",
    "category": "MoE",
    "total_params_b": 141.0,
    "active_params_b": 39.0,
    "context_window_tokens": 65536,
    "context_window_str": "64k",
    "intelligence_index": 44.8,
    "briefcase_elo": 1470,
    "output_speed_tok_s": 85.0,
    "latency_ttft_s": 0.48,
    "openness_index": 85.0,
    "license": "Apache 2.0",
    "description": "Popular sparse MoE model with 39B active params, highly balanced for distributed local inference.",
    "memory_req_gb": {
      "fp16": 310.3,
      "q8_0": 166.6,
      "q6_k": 130.2,
      "q5_k_m": 109.1,
      "q4_k_m": 90.0,
      "q3_k_m": 68.9,
      "q2_k": 51.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.0,
      "q3_k_m": 94.6,
      "q2_k": 88.6
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "mixtral_8x7b",
    "name": "Mixtral 8x7B Instruct",
    "creator": "Mistral AI",
    "category": "MoE",
    "total_params_b": 46.7,
    "active_params_b": 12.9,
    "context_window_tokens": 32768,
    "context_window_str": "32k",
    "intelligence_index": 40.2,
    "briefcase_elo": 1395,
    "output_speed_tok_s": 125.0,
    "latency_ttft_s": 0.32,
    "openness_index": 88.0,
    "license": "Apache 2.0",
    "description": "Original trailblazing MoE model running at 13B active compute footprint.",
    "memory_req_gb": {
      "fp16": 103.7,
      "q8_0": 56.1,
      "q6_k": 44.1,
      "q5_k_m": 37.1,
      "q4_k_m": 30.7,
      "q3_k_m": 23.8,
      "q2_k": 18.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "devstral_2_24b",
    "name": "Devstral 2 / Codestral 24B",
    "creator": "Mistral AI",
    "category": "Dense",
    "total_params_b": 24.0,
    "active_params_b": 24.0,
    "context_window_tokens": 262144,
    "context_window_str": "256k",
    "intelligence_index": 42.5,
    "briefcase_elo": 1445,
    "output_speed_tok_s": 110.0,
    "latency_ttft_s": 0.35,
    "openness_index": 82.0,
    "license": "Mistral License",
    "description": "Specialized coding and software development model with extensive 256k context support.",
    "memory_req_gb": {
      "fp16": 53.7,
      "q8_0": 29.3,
      "q6_k": 23.1,
      "q5_k_m": 19.5,
      "q4_k_m": 16.2,
      "q3_k_m": 12.8,
      "q2_k": 9.9
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "mistral_nemo_12b",
    "name": "Mistral NeMo 12B Instruct",
    "creator": "Mistral AI / NVIDIA",
    "category": "Dense",
    "total_params_b": 12.2,
    "active_params_b": 12.2,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 38.5,
    "briefcase_elo": 1375,
    "output_speed_tok_s": 145.0,
    "latency_ttft_s": 0.27,
    "openness_index": 86.0,
    "license": "Apache 2.0",
    "description": "Collaborative 12B model with Tekken tokenizer supporting 128k context.",
    "memory_req_gb": {
      "fp16": 27.6,
      "q8_0": 15.2,
      "q6_k": 12.2,
      "q5_k_m": 10.4,
      "q4_k_m": 8.8,
      "q3_k_m": 7.1,
      "q2_k": 5.6
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "ministral_8b",
    "name": "Ministral 8B Instruct",
    "creator": "Mistral AI",
    "category": "Dense",
    "total_params_b": 8.0,
    "active_params_b": 8.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 36.0,
    "briefcase_elo": 1335,
    "output_speed_tok_s": 165.0,
    "latency_ttft_s": 0.25,
    "openness_index": 83.0,
    "license": "Mistral Research License",
    "description": "On-device powerhouse tailored for low-latency reasoning and tool orchestration.",
    "memory_req_gb": {
      "fp16": 18.3,
      "q8_0": 10.3,
      "q6_k": 8.3,
      "q5_k_m": 7.2,
      "q4_k_m": 6.1,
      "q3_k_m": 5.0,
      "q2_k": 4.0
    },
    "quant_accuracy_pct": {
      "fp16": 99.0,
      "q8_0": 98.8,
      "q6_k": 98.3,
      "q5_k_m": 97.6,
      "q4_k_m": 96.4,
      "q3_k_m": 92.0,
      "q2_k": 86.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "nemotron_3_ultra_550b",
    "name": "Nemotron 3 Ultra (550B A55B)",
    "creator": "NVIDIA",
    "category": "MoE",
    "total_params_b": 550.0,
    "active_params_b": 55.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 38.3,
    "briefcase_elo": 1490,
    "output_speed_tok_s": 133.5,
    "latency_ttft_s": 0.52,
    "openness_index": 83.3,
    "license": "NVIDIA Open Model License",
    "description": "NVIDIA's optimized enterprise MoE model tailored for TensorRT-LLM and NeMo high-throughput stacks.",
    "memory_req_gb": {
      "fp16": 1202.9,
      "q8_0": 642.6,
      "q6_k": 500.6,
      "q5_k_m": 418.4,
      "q4_k_m": 343.7,
      "q3_k_m": 261.5,
      "q2_k": 194.3
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "nemotron_3_super_120b",
    "name": "Nemotron 3 Super (120B A12.7B)",
    "creator": "NVIDIA",
    "category": "MoE",
    "total_params_b": 120.6,
    "active_params_b": 12.7,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 36.1,
    "briefcase_elo": 1435,
    "output_speed_tok_s": 155.0,
    "latency_ttft_s": 0.41,
    "openness_index": 83.3,
    "license": "NVIDIA Open Model License",
    "description": "Super-fast MoE model designed for multi-GPU workstations with 12.7B active compute footprint.",
    "memory_req_gb": {
      "fp16": 265.6,
      "q8_0": 142.8,
      "q6_k": 111.6,
      "q5_k_m": 93.6,
      "q4_k_m": 77.2,
      "q3_k_m": 59.2,
      "q2_k": 44.5
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 98.8,
      "q3_k_m": 94.4,
      "q2_k": 88.4
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "llama_3_1_nemotron_70b",
    "name": "Llama 3.1 Nemotron 70B",
    "creator": "NVIDIA",
    "category": "Dense",
    "total_params_b": 70.6,
    "active_params_b": 70.6,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 49.1,
    "briefcase_elo": 1530,
    "output_speed_tok_s": 75.0,
    "latency_ttft_s": 0.53,
    "openness_index": 84.0,
    "license": "NVIDIA Open Model License",
    "description": "RLHF-tuned 70B model customized by NVIDIA for top-tier prompt alignment and synthetic generation.",
    "memory_req_gb": {
      "fp16": 156.1,
      "q8_0": 84.2,
      "q6_k": 66.0,
      "q5_k_m": 55.4,
      "q4_k_m": 45.8,
      "q3_k_m": 35.3,
      "q2_k": 26.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.4,
      "q4_k_m": 98.2,
      "q3_k_m": 93.8,
      "q2_k": 87.8
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "nemotron_3_5_lightning",
    "name": "Nemotron 3.5 Lightning (31.6B A3.6B)",
    "creator": "NVIDIA",
    "category": "MoE",
    "total_params_b": 31.6,
    "active_params_b": 3.6,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 33.4,
    "briefcase_elo": 1360,
    "output_speed_tok_s": 240.0,
    "latency_ttft_s": 0.22,
    "openness_index": 83.3,
    "license": "NVIDIA Open Model License",
    "description": "Ultra-low latency MoE model running at blistering inference speeds on single GPUs.",
    "memory_req_gb": {
      "fp16": 70.5,
      "q8_0": 38.3,
      "q6_k": 30.1,
      "q5_k_m": 25.4,
      "q4_k_m": 21.1,
      "q3_k_m": 16.4,
      "q2_k": 12.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "command_a_plus",
    "name": "Command A+ (218B A25B)",
    "creator": "Cohere",
    "category": "MoE",
    "total_params_b": 218.0,
    "active_params_b": 25.0,
    "context_window_tokens": 262144,
    "context_window_str": "256k",
    "intelligence_index": 47.6,
    "briefcase_elo": 1510,
    "output_speed_tok_s": 92.0,
    "latency_ttft_s": 0.4,
    "openness_index": 79.0,
    "license": "CC-BY-NC-4.0",
    "description": "Cohere's enterprise-grade MoE model built specifically for agentic workflows and RAG.",
    "memory_req_gb": {
      "fp16": 478.5,
      "q8_0": 256.4,
      "q6_k": 200.2,
      "q5_k_m": 167.6,
      "q4_k_m": 138.0,
      "q3_k_m": 105.4,
      "q2_k": 78.8
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "command_r_plus",
    "name": "Command R+ (104B)",
    "creator": "Cohere",
    "category": "Dense",
    "total_params_b": 104.0,
    "active_params_b": 104.0,
    "context_window_tokens": 131072,
    "context_window_str": "128k",
    "intelligence_index": 46.2,
    "briefcase_elo": 1490,
    "output_speed_tok_s": 70.0,
    "latency_ttft_s": 0.55,
    "openness_index": 80.0,
    "license": "CC-BY-NC-4.0",
    "description": "Optimized for conversational interactions, tool use, and long-document RAG pipelines.",
    "memory_req_gb": {
      "fp16": 229.3,
      "q8_0": 123.3,
      "q6_k": 96.5,
      "q5_k_m": 81.0,
      "q4_k_m": 66.8,
      "q3_k_m": 51.3,
      "q2_k": 38.6
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 99.8,
      "q4_k_m": 98.6,
      "q3_k_m": 94.2,
      "q2_k": 88.2
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "kimi_k3_max",
    "name": "Kimi K3 (max 2.8T MoE)",
    "creator": "Moonshot / Kimi",
    "category": "MoE",
    "total_params_b": 2800.0,
    "active_params_b": 104.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 59.7,
    "briefcase_elo": 1680,
    "output_speed_tok_s": 40.3,
    "latency_ttft_s": 3.58,
    "openness_index": 78.0,
    "license": "Open Weights",
    "description": "Massive high-reasoning MoE model with 104B active parameters and 1M context support.",
    "memory_req_gb": {
      "fp16": 6093.8,
      "q8_0": 3241.1,
      "q6_k": 2518.4,
      "q5_k_m": 2100.0,
      "q4_k_m": 1719.6,
      "q3_k_m": 1301.2,
      "q2_k": 958.9
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "glm_5_2_max",
    "name": "GLM-5.2 (max 753B)",
    "creator": "Zhipu AI",
    "category": "MoE",
    "total_params_b": 753.0,
    "active_params_b": 40.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 52.6,
    "briefcase_elo": 1580,
    "output_speed_tok_s": 115.4,
    "latency_ttft_s": 0.65,
    "openness_index": 80.0,
    "license": "Open Weights",
    "description": "Zhipu AI's bilingual MoE model with 40B active parameters and 1M context window capability.",
    "memory_req_gb": {
      "fp16": 1644.6,
      "q8_0": 877.5,
      "q6_k": 683.1,
      "q5_k_m": 570.6,
      "q4_k_m": 468.3,
      "q3_k_m": 355.8,
      "q2_k": 263.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "solar_open2_250b",
    "name": "Solar Open2 250B",
    "creator": "Upstage",
    "category": "Dense",
    "total_params_b": 250.0,
    "active_params_b": 250.0,
    "context_window_tokens": 65536,
    "context_window_str": "64k",
    "intelligence_index": 47.9,
    "briefcase_elo": 1515,
    "output_speed_tok_s": 45.0,
    "latency_ttft_s": 0.92,
    "openness_index": 82.0,
    "license": "Apache 2.0",
    "description": "Large-scale dense model using depth-up-scaling with balanced general knowledge and reasoning.",
    "memory_req_gb": {
      "fp16": 548.4,
      "q8_0": 293.7,
      "q6_k": 229.2,
      "q5_k_m": 191.8,
      "q4_k_m": 157.9,
      "q3_k_m": 120.5,
      "q2_k": 90.0
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "k_exaone_2_0",
    "name": "K-EXAONE 2.0 (750B A37B)",
    "creator": "LG AI Research",
    "category": "MoE",
    "total_params_b": 750.0,
    "active_params_b": 37.0,
    "context_window_tokens": 1048576,
    "context_window_str": "1M",
    "intelligence_index": 51.5,
    "briefcase_elo": 1560,
    "output_speed_tok_s": 102.0,
    "latency_ttft_s": 0.68,
    "openness_index": 78.0,
    "license": "Open Weights",
    "description": "LG AI's flagship MoE model specialized for scientific discovery, mathematics, and reasoning.",
    "memory_req_gb": {
      "fp16": 1638.1,
      "q8_0": 874.0,
      "q6_k": 680.4,
      "q5_k_m": 568.4,
      "q4_k_m": 466.5,
      "q3_k_m": 354.4,
      "q2_k": 262.7
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 100.0,
      "q6_k": 100.0,
      "q5_k_m": 100.0,
      "q4_k_m": 99.9,
      "q3_k_m": 95.5,
      "q2_k": 89.5
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  },
  {
    "id": "phi_4_14b",
    "name": "Phi-4 14B",
    "creator": "Microsoft",
    "category": "Dense",
    "total_params_b": 14.7,
    "active_params_b": 14.7,
    "context_window_tokens": 16384,
    "context_window_str": "16k",
    "intelligence_index": 41.2,
    "briefcase_elo": 1420,
    "output_speed_tok_s": 125.0,
    "latency_ttft_s": 0.31,
    "openness_index": 87.0,
    "license": "MIT",
    "description": "Microsoft's synthetic-data trained powerhouse with exceptional math and logic capabilities in 14B.",
    "memory_req_gb": {
      "fp16": 33.2,
      "q8_0": 18.2,
      "q6_k": 14.5,
      "q5_k_m": 12.3,
      "q4_k_m": 10.4,
      "q3_k_m": 8.3,
      "q2_k": 6.6
    },
    "quant_accuracy_pct": {
      "fp16": 100.0,
      "q8_0": 99.8,
      "q6_k": 99.3,
      "q5_k_m": 98.6,
      "q4_k_m": 97.4,
      "q3_k_m": 93.0,
      "q2_k": 87.0
    },
    "quant_ppl_delta": {
      "fp16": 0.0,
      "q8_0": 0.02,
      "q6_k": 0.04,
      "q5_k_m": 0.09,
      "q4_k_m": 0.18,
      "q3_k_m": 0.48,
      "q2_k": 1.15
    }
  }
];

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
    console.log('Using embedded devices dataset (file:// mode)');
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
    console.log('Using embedded models dataset (file:// mode)');
    state.rawModels = EMBEDDED_MODELS;
  }
}

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
      } else if (btn.dataset.tab === 'device-table') {
        renderDeviceTable();
      }
    });
  });
}

// ================= CONTROL LISTENERS =================
function initControlListeners() {
  document.querySelectorAll('input[name="chartMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.chartMode = e.target.value;
      const tpRow = document.getElementById('tpEffRow');
      if (tpRow) {
        tpRow.style.display = state.chartMode === 'tp-ceiling' ? 'flex' : 'none';
      }
      recalculateAndRender();
    });
  });

  const toggleSys = document.getElementById('toggleSystemContext');
  if (toggleSys) {
    toggleSys.addEventListener('change', (e) => {
      state.useSystemContext = e.target.checked;
      const sysCtrl = document.getElementById('systemContextControls');
      if (sysCtrl) {
        sysCtrl.style.opacity = state.useSystemContext ? '1.0' : '0.4';
        sysCtrl.style.pointerEvents = state.useSystemContext ? 'auto' : 'none';
      }
      updateFootnote();
      recalculateAndRender();
    });
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
    return `${parseFloat(v).toFixed(1)}×`;
  });
  bindSlider('sliderWeightBw', 'lblWeightBw', (v) => {
    state.weightBw = parseFloat(v);
    document.getElementById('fBw').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}×`;
  });
  bindSlider('sliderWeightFlops', 'lblWeightFlops', (v) => {
    state.weightFlops = parseFloat(v);
    document.getElementById('fFlops').textContent = parseFloat(v).toFixed(1);
    return `${parseFloat(v).toFixed(1)}×`;
  });
  bindSlider('sliderCudaBoost', 'lblCudaBoost', (v) => {
    state.cudaBoost = parseFloat(v);
    document.getElementById('fCuda').textContent = `${parseFloat(v).toFixed(2)}x CUDA`;
    return `${parseFloat(v).toFixed(2)}×`;
  });
  bindSlider('sliderTpEff', 'lblTpEff', (v) => {
    state.tpEfficiency = parseFloat(v);
    return `${parseFloat(v).toFixed(2)}×`;
  });

  // Preset Buttons
  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = PRESETS[btn.dataset.preset];
      if (p) {
        setSliderVal('sliderWeightMem', 'lblWeightMem', p.wMem, `${p.wMem.toFixed(1)}×`);
        setSliderVal('sliderWeightBw', 'lblWeightBw', p.wBw, `${p.wBw.toFixed(1)}×`);
        setSliderVal('sliderWeightFlops', 'lblWeightFlops', p.wFlops, `${p.wFlops.toFixed(1)}×`);
        setSliderVal('sliderCudaBoost', 'lblCudaBoost', p.cuda, `${p.cuda.toFixed(2)}×`);
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
      renderScatterPlot();
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
        config: {
          useSystemContext: state.useSystemContext,
          hostCost: state.hostCostUsd,
          osOverhead: state.macOsOverheadGb,
          weightMem: state.weightMem,
          weightBw: state.weightBw,
          weightFlops: state.weightFlops,
          cudaBoost: state.cudaBoost
        }
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

// ================= INTERACTIVE ZOOM & PAN ENGINE =================
function initZoomPanListeners() {
  const wrapper = document.getElementById('plotWrapper');
  const btnIn = document.getElementById('btnZoomIn');
  const btnOut = document.getElementById('btnZoomOut');
  const btnReset = document.getElementById('btnResetZoom');
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
      
      // Zoom centered at cursor
      state.panX = cx - (cx - state.panX) * (newScale / oldScale);
      state.panY = cy - (cy - state.panY) * (newScale / oldScale);
    }
    
    state.zoomScale = newScale;
    updateZoomLabel();
    renderScatterPlot();
  }

  if (btnIn) {
    btnIn.addEventListener('click', () => applyZoom(1.3));
  }
  if (btnOut) {
    btnOut.addEventListener('click', () => applyZoom(0.77));
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.zoomScale = 1.0;
      state.panX = 0;
      state.panY = 0;
      updateZoomLabel();
      renderScatterPlot();
    });
  }

  if (wrapper) {
    // Mouse Wheel Zoom
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      applyZoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Drag to Pan
    wrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      state.isDragging = true;
      state.dragStartX = e.clientX - state.panX;
      state.dragStartY = e.clientY - state.panY;
      wrapper.classList.add('is-panning');
    });

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

    // Double click to fit
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
      fn.textContent = `System Context is ACTIVE: Discrete GPUs include +$${state.hostCostUsd} host platform cost; Unified systems deduct ${state.macOsOverheadGb}GB OS overhead.`;
    } else {
      fn.textContent = `System Context is OFF: Showing bare hardware purchase price ($P) and unadjusted total raw capacity ($C).`;
    }
  }
}

// ================= MATHEMATICAL MODEL & PARETO ENGINE =================
function calculateDeviceScore(dev, multiplier = 1, isTpCeiling = false) {
  const isUnified = dev.category === 'unified-memory system';
  const rawCap = parseFloat(dev.memory_capacity_gb) || 1;
  const rawBw = parseFloat(dev.local_memory_bandwidth_gbs) || 1;
  const rawFlops = parseFloat(dev.fp16_tflops) || 10;
  const isCuda = (dev.cuda_supported || 'no').toLowerCase() === 'yes';

  // Capacity calculation
  let effCap = rawCap * multiplier;
  if (state.useSystemContext && isUnified) {
    const osDeduction = state.macOsOverheadGb * multiplier;
    effCap = Math.max(2, effCap - osDeduction);
  }

  // Bandwidth calculation
  let effBw = rawBw;
  if (isTpCeiling && multiplier > 1) {
    effBw = rawBw * multiplier * state.tpEfficiency;
  }

  // Compute calculation
  const effFlops = rawFlops * multiplier;

  // Ecosystem boost
  const effBoost = isCuda ? state.cudaBoost : 1.0;

  // Multi-Factor Score: (C^wMem) * (B^wBw) * (T^wFlops) * CudaBoost
  const score = Math.pow(effCap, state.weightMem) * 
                Math.pow(effBw, state.weightBw) * 
                Math.pow(Math.max(1, effFlops), state.weightFlops) * 
                effBoost;

  // Effective Price calculation
  const basePrice = parseFloat(dev.price_usd) || 1;
  let effPrice = basePrice * multiplier;
  if (state.useSystemContext && !isUnified) {
    effPrice += state.hostCostUsd;
  }

  return {
    effCap: Math.round(effCap * 10) / 10,
    effBw: Math.round(effBw),
    effFlops: Math.round(effFlops * 10) / 10,
    effPrice: Math.round(effPrice),
    score: Math.round(score)
  };
}

function processAllPoints() {
  const points = [];

  state.rawDevices.forEach(dev => {
    // Filtering
    if (!state.allowedVendors.has(dev.vendor)) return;
    if (!state.includeModded && (dev.modified || 'no').toLowerCase() === 'yes') return;
    if (!state.includeDatacenter && parseFloat(dev.price_usd) > 50000) return;

    // 1. Single Device Point
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
      rawDevice: dev,
      label: dev.device_name
    });

    // 2. 2x Capacity Sharded Point
    if (state.chartMode === 'capacity' || state.chartMode === 'tp-ceiling') {
      const sharded = calculateDeviceScore(dev, 2, false);
      points.push({
        id: `${dev.id}_2x_cap`,
        baseId: dev.id,
        name: `2× ${dev.device_name} (Cap Sharded)`,
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
        rawDevice: dev,
        label: `2× ${dev.device_name}`
      });
    }

    // 3. 2x Tensor-Parallel Ceiling Point
    if (state.chartMode === 'tp-ceiling') {
      const tp = calculateDeviceScore(dev, 2, true);
      points.push({
        id: `${dev.id}_2x_tp`,
        baseId: dev.id,
        name: `2× ${dev.device_name} (TP Ceiling)`,
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
        rawDevice: dev,
        label: `2× ${dev.device_name} [TP]`
      });
    }
  });

  // Calculate Pareto Frontier (Max score for given or lower price)
  points.sort((a, b) => a.effPrice - b.effPrice || b.score - a.score);

  let maxScore = -1;
  const paretoPoints = [];

  points.forEach(pt => {
    if (pt.score > maxScore) {
      pt.isPareto = true;
      maxScore = pt.score;
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
  renderDeviceTable();
}

// ================= SCATTER PLOT SVG RENDERING WITH SMART ANNOTATIONS =================
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

  // Extents
  const minPrice = Math.min(...state.processedPoints.map(p => p.effPrice));
  const maxPrice = Math.max(...state.processedPoints.map(p => p.effPrice));
  const minScore = Math.min(...state.processedPoints.map(p => p.score));
  const maxScore = Math.max(...state.processedPoints.map(p => p.score));

  const xMin = state.isLogScale ? Math.max(100, minPrice * 0.8) : 0;
  const xMax = maxPrice * 1.25;
  const yMin = state.isLogScale ? Math.max(100, minScore * 0.8) : 0;
  const yMax = maxScore * 1.35;

  // Base Scale Functions
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

  // Apply Zoom & Pan Transform
  function getX(val) {
    const bx = getBaseX(val);
    return state.panX + bx * state.zoomScale;
  }

  function getY(val) {
    const by = getBaseY(val);
    return state.panY + by * state.zoomScale;
  }

  // Draw Grid Lines & Axes
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'grid-group');

  // X-Axis Ticks
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
    ? [1000, 5000, 20000, 50000, 200000, 1000000, 5000000, 20000000].filter(t => t >= yMin && t <= yMax)
    : [0, 50000, 200000, 500000, 1000000, 5000000];

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
  yLabel.textContent = `Performance Score [C^${state.weightMem} · B^${state.weightBw} · T^${state.weightFlops} · CUDA]`;
  svg.appendChild(yLabel);

  // Draw Pareto Frontier Path
  if (state.paretoPoints && state.paretoPoints.length > 1) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';
    state.paretoPoints.forEach((pt, idx) => {
      const px = getX(pt.effPrice);
      const py = getY(pt.score);
      d += (idx === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
    });
    path.setAttribute('d', d);
    path.setAttribute('class', 'pareto-line');
    svg.appendChild(path);
  }

  // Draw Data Markers
  const markersGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  state.processedPoints.forEach(pt => {
    const px = getX(pt.effPrice);
    const py = getY(pt.score);
    const isSelected = pt.baseId === state.selectedDeviceId;
    const isPareto = pt.isPareto;

    // Outer Glow / Marker Geometry
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.setAttribute('class', `data-marker ${isSelected ? 'is-selected' : ''}`);
    marker.setAttribute('data-id', pt.baseId);

    const fillColor = isPareto ? '#f59e0b' : '#64748b';
    const strokeColor = isSelected ? '#38bdf8' : (isPareto ? '#d97706' : '#334155');
    const radius = (isPareto ? 8 : 6) * Math.min(1.4, Math.max(0.8, Math.sqrt(state.zoomScale)));

    if (pt.pointType === 'circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', isSelected ? 3 : 1.5);
      marker.appendChild(circle);
    } else if (pt.pointType === 'diamond') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const r = radius * 1.2;
      poly.setAttribute('points', `${px},${py - r} ${px + r},${py} ${px},${py + r} ${px - r},${py}`);
      poly.setAttribute('fill', fillColor);
      poly.setAttribute('stroke', strokeColor);
      poly.setAttribute('stroke-width', isSelected ? 3 : 1.5);
      marker.appendChild(poly);
    } else if (pt.pointType === 'square') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const s = radius * 1.8;
      rect.setAttribute('x', px - s/2);
      rect.setAttribute('y', py - s/2);
      rect.setAttribute('width', s);
      rect.setAttribute('height', s);
      rect.setAttribute('rx', 2);
      rect.setAttribute('fill', fillColor);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', isSelected ? 3 : 1.5);
      marker.appendChild(rect);
    } else if (pt.pointType === 'triangle') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const r = radius * 1.4;
      poly.setAttribute('points', `${px},${py - r} ${px + r * 0.866},${py + r * 0.5} ${px - r * 0.866},${py + r * 0.5}`);
      poly.setAttribute('fill', fillColor);
      poly.setAttribute('stroke', strokeColor);
      poly.setAttribute('stroke-width', isSelected ? 3 : 1.5);
      marker.appendChild(poly);
    }

    // Interactivity
    marker.addEventListener('mouseenter', (e) => showTooltip(e, pt));
    marker.addEventListener('mousemove', (e) => moveTooltip(e));
    marker.addEventListener('mouseleave', () => hideTooltip());
    marker.addEventListener('click', () => selectDevice(pt.baseId));

    markersGroup.appendChild(marker);

    // ================= ADAPTIVE SMART ANNOTATIONS =================
    let shouldShowLabel = false;
    if (state.labelMode === 'all') {
      shouldShowLabel = true;
    } else if (state.labelMode === 'pareto') {
      shouldShowLabel = isPareto || isSelected;
    } else if (state.labelMode === 'auto') {
      // If zoomed out (<1.3x), show Pareto points & selected. If zoomed in (>=1.3x), show all.
      shouldShowLabel = (state.zoomScale >= 1.3) ? true : (isPareto || isSelected);
    }

    if (shouldShowLabel) {
      const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelGroup.setAttribute('class', 'callout-box');
      labelGroup.addEventListener('click', () => selectDevice(pt.baseId));

      // Leader line vector calculation (adaptive offset)
      const offsetX = (px > margin.left + plotWidth * 0.75) ? -130 : 25;
      const offsetY = (py < margin.top + 50) ? 25 : -28;
      const lx = px + offsetX;
      const ly = py + offsetY;

      const leader = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      leader.setAttribute('x1', px);
      leader.setAttribute('y1', py);
      leader.setAttribute('x2', lx);
      leader.setAttribute('y2', ly + 8);
      leader.setAttribute('class', 'leader-line');
      labelsGroup.appendChild(leader);

      // Callout Rect
      const boxW = Math.max(115, pt.label.length * 6.5);
      const boxH = 28;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', offsetX < 0 ? lx - boxW : lx);
      rect.setAttribute('y', ly - 6);
      rect.setAttribute('width', boxW);
      rect.setAttribute('height', boxH);
      rect.setAttribute('class', 'callout-rect');
      labelGroup.appendChild(rect);

      // Title Text
      const textTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textTitle.setAttribute('x', (offsetX < 0 ? lx - boxW : lx) + 6);
      textTitle.setAttribute('y', ly + 6);
      textTitle.setAttribute('class', 'callout-text-title');
      textTitle.textContent = pt.label;
      labelGroup.appendChild(textTitle);

      // Subtitle / Price Text
      const textSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textSub.setAttribute('x', (offsetX < 0 ? lx - boxW : lx) + 6);
      textSub.setAttribute('y', ly + 18);
      textSub.setAttribute('class', 'callout-text-sub');
      textSub.textContent = `$${pt.effPrice.toLocaleString()} · ${pt.effCap}GB · ${pt.effBw}GB/s`;
      labelGroup.appendChild(textSub);

      labelsGroup.appendChild(labelGroup);
    }
  });

  svg.appendChild(markersGroup);
  svg.appendChild(labelsGroup);
}

// Tooltips
function showTooltip(e, pt) {
  const tt = document.getElementById('plotTooltip');
  if (!tt) return;
  tt.style.display = 'block';
  tt.innerHTML = `
    <div class="tooltip-title">${pt.name}</div>
    <div class="tooltip-grid">
      <span class="tooltip-lbl">Base Hardware Price:</span>
      <span class="tooltip-val">$${parseFloat(pt.rawDevice.price_usd).toLocaleString()}</span>
      
      <span class="tooltip-lbl">Effective System Price:</span>
      <span class="tooltip-val">$${pt.effPrice.toLocaleString()}</span>

      <span class="tooltip-lbl">Usable AI Memory:</span>
      <span class="tooltip-val">${pt.effCap} GB (${pt.rawDevice.memory_type || 'VRAM'})</span>

      <span class="tooltip-lbl">Memory Bandwidth:</span>
      <span class="tooltip-val">${pt.effBw} GB/s</span>

      <span class="tooltip-lbl">Compute FP16:</span>
      <span class="tooltip-val">${pt.effFlops} TFLOPS</span>

      <span class="tooltip-lbl">Weighted Value Score:</span>
      <span class="tooltip-val" style="color:#f59e0b">${pt.score.toLocaleString()}</span>

      <span class="tooltip-lbl">Pareto Status:</span>
      <span class="tooltip-val" style="color:${pt.isPareto ? '#10b981' : '#94a3b8'}">${pt.isPareto ? '★ Pareto-Optimal' : 'Dominated'}</span>
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
function selectDevice(deviceId) {
  state.selectedDeviceId = deviceId;
  state.selectedExplorerHardwareId = deviceId;
  
  const dev = state.rawDevices.find(d => d.id === deviceId);
  const drawer = document.getElementById('deviceDetailDrawer');
  const body = document.getElementById('drawerBody');
  const catBadge = document.getElementById('detCategory');

  if (!dev || !drawer || !body) return;

  catBadge.textContent = dev.category;
  catBadge.className = `badge ${dev.category === 'unified-memory system' ? 'badge-accent' : 'badge-subtle'}`;

  const calc = calculateDeviceScore(dev, 1, false);

  body.innerHTML = `
    <div class="device-spec-hero">
      <h3 class="device-spec-name">${dev.device_name}</h3>
      <div class="device-spec-price-row">
        <span class="device-spec-price">$${parseFloat(dev.price_usd).toLocaleString()}</span>
        <span class="device-spec-tco">· System TCO: <strong>$${calc.effPrice.toLocaleString()}</strong></span>
      </div>
    </div>

    <div class="spec-metrics-grid">
      <div class="spec-metric-card">
        <div class="spec-metric-label">Memory Capacity</div>
        <div class="spec-metric-value">${calc.effCap} GB <small style="font-size:0.7rem;color:#94a3b8">(${dev.memory_capacity_gb}GB raw)</small></div>
      </div>
      <div class="spec-metric-card">
        <div class="spec-metric-label">Memory Bandwidth</div>
        <div class="spec-metric-value">${dev.local_memory_bandwidth_gbs} GB/s</div>
      </div>
      <div class="spec-metric-card">
        <div class="spec-metric-label">Compute FP16</div>
        <div class="spec-metric-value">${dev.fp16_tflops || '—'} TFLOPS</div>
      </div>
      <div class="spec-metric-card">
        <div class="spec-metric-label">Weighted Score</div>
        <div class="spec-metric-value" style="color:#f59e0b">${calc.score.toLocaleString()}</div>
      </div>
    </div>

    <div class="spec-notes-section">
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
      <div class="spec-note-item" style="border-left-color:#f59e0b">
        <div class="spec-note-title">System Caveats</div>
        <div class="spec-note-desc">${dev.caveats}</div>
      </div>
      ` : ''}
    </div>
  `;

  renderScatterPlot();
  
  // Sync Explorer
  const selExpDev = document.getElementById('selExplorerHardware');
  if (selExpDev) {
    selExpDev.value = deviceId;
    renderHardwareToModelsFit(dev);
  }
}

// ================= TAB 2: HARDWARE-MODEL FIT MATRIX =================
function renderFitMatrix() {
  const tableBody = document.getElementById('matrixBody');
  const headerRow = document.getElementById('matrixHeaderRow');
  if (!tableBody || !headerRow || state.rawModels.length === 0) return;

  // Filter models by class
  let models = state.rawModels;
  if (state.modelClassFilter === 'compact') models = models.filter(m => m.total_params_b <= 14);
  else if (state.modelClassFilter === 'mid') models = models.filter(m => m.total_params_b > 14 && m.total_params_b <= 70.6);
  else if (state.modelClassFilter === 'large') models = models.filter(m => m.total_params_b > 70.6 && m.total_params_b <= 150);
  else if (state.modelClassFilter === 'ultra') models = models.filter(m => m.total_params_b > 150);

  // Setup Model Columns Headers
  while (headerRow.children.length > 2) {
    headerRow.removeChild(headerRow.lastChild);
  }

  models.forEach(m => {
    const th = document.createElement('th');
    th.innerHTML = `
      <div style="font-weight:700;color:#fff">${m.name}</div>
      <div style="font-size:0.7rem;color:#94a3b8">${m.total_params_b}B · ${m.category}</div>
    `;
    headerRow.appendChild(th);
  });

  // Populate Hardware Rows
  tableBody.innerHTML = '';
  state.rawDevices.forEach(dev => {
    if (!state.allowedVendors.has(dev.vendor)) return;
    if (!state.includeModded && (dev.modified || 'no').toLowerCase() === 'yes') return;
    if (!state.includeDatacenter && parseFloat(dev.price_usd) > 50000) return;

    const calc = calculateDeviceScore(dev, 1, false);
    const usableVram = calc.effCap;
    const bw = parseFloat(dev.local_memory_bandwidth_gbs) || 1;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="sticky-col">
        <strong>${dev.device_name}</strong>
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

  // Setup Explorers
  initModelFitExplorers();
}

function calculateModelFit(model, usableVram, bandwidth) {
  const req = model.memory_req_gb || {};
  const filter = state.quantAccuracyFilter;

  // Check quant tiers in order of preference
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

// Two-Way Fit Explorers
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
    if (state.rawModels.length > 0) {
      renderModelToHardwareFit(state.rawModels[0]);
    }
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
    if (state.rawDevices.length > 0) {
      renderHardwareToModelsFit(state.rawDevices[0]);
    }
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

    const item = document.createElement('div');
    item.className = 'fit-result-item';
    item.innerHTML = `
      <div>
        <div class="fit-result-title">${dev.device_name}</div>
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
  if (!grid || state.rawModels.length === 0) return;

  const query = (txtSearch ? txtSearch.value : '').toLowerCase().trim();

  let models = state.rawModels;
  if (query) {
    models = models.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.creator.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      (m.description || '').toLowerCase().includes(query)
    );
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
          <p class="model-creator">${m.creator} · ${m.category} Architecture</p>
        </div>
        <span class="badge badge-accent">${m.total_params_b}B</span>
      </div>

      <div class="model-stats-row">
        <div class="model-stat-box">
          <span class="model-stat-lbl">Intelligence</span>
          <span class="model-stat-val">${m.intelligence_index || '—'}</span>
        </div>
        <div class="model-stat-box">
          <span class="model-stat-lbl">Speed</span>
          <span class="model-stat-val">${m.output_speed_tok_s ? `${m.output_speed_tok_s} t/s` : '—'}</span>
        </div>
        <div class="model-stat-box">
          <span class="model-stat-lbl">Context</span>
          <span class="model-stat-val">${m.context_window_str || '128k'}</span>
        </div>
      </div>

      <p class="model-desc">${m.description || ''}</p>

      <div style="font-size:0.72rem;color:#94a3b8;margin-top:2px;">Unsloth VRAM Requirements & Accuracy:</div>
      <div class="model-quant-mem-pills">
        <span class="quant-pill">FP16: <strong>${req.fp16 || '—'}GB</strong> (100%)</span>
        <span class="quant-pill">Q8: <strong>${req.q8_0 || '—'}GB</strong> (99.8%)</span>
        <span class="quant-pill">Q5: <strong>${req.q5_k_m || '—'}GB</strong> (98.6%)</span>
        <span class="quant-pill">Q4: <strong>${req.q4_k_m || '—'}GB</strong> (97.4%)</span>
        <span class="quant-pill">Q3: <strong>${req.q3_k_m || '—'}GB</strong> (93%)</span>
        <span class="quant-pill">Q2: <strong>${req.q2_k || '—'}GB</strong> (87%)</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ================= TAB 4: DEVICE DATABASE & TCO =================
function renderDeviceTable() {
  const tbody = document.getElementById('tblHardwareDevicesBody');
  const txtSearch = document.getElementById('txtSearchDevices');
  if (!tbody || state.rawDevices.length === 0) return;

  const query = (txtSearch ? txtSearch.value : '').toLowerCase().trim();

  let devices = state.rawDevices;
  if (query) {
    devices = devices.filter(d => 
      d.device_name.toLowerCase().includes(query) ||
      d.vendor.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query)
    );
  }

  tbody.innerHTML = '';
  devices.forEach(dev => {
    const calc = calculateDeviceScore(dev, 1, false);
    const pt = state.processedPoints.find(p => p.baseId === dev.id && p.multiplier === 1);
    const isPareto = pt ? pt.isPareto : false;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${dev.device_name}</strong></td>
      <td>${dev.vendor}</td>
      <td><span class="badge ${dev.category.includes('unified') ? 'badge-accent' : 'badge-subtle'}">${dev.category}</span></td>
      <td style="font-family:var(--font-mono)">$${parseFloat(dev.price_usd).toLocaleString()}</td>
      <td style="font-family:var(--font-mono);color:#38bdf8"><strong>$${calc.effPrice.toLocaleString()}</strong></td>
      <td style="font-family:var(--font-mono)">${dev.memory_capacity_gb} GB</td>
      <td style="font-family:var(--font-mono);color:#34d399">${calc.effCap} GB</td>
      <td style="font-family:var(--font-mono)">${dev.local_memory_bandwidth_gbs} GB/s</td>
      <td style="font-family:var(--font-mono)">${dev.fp16_tflops || '—'}</td>
      <td style="font-size:0.75rem;color:#94a3b8">${dev.nvlink === 'yes' ? 'NVLink' : (dev.thunderbolt5 === 'yes' ? 'TB5' : (dev.connectx7 === 'yes' ? 'ConnectX-7' : 'PCIe'))}</td>
      <td style="font-family:var(--font-mono);font-weight:700;color:#f59e0b">${calc.score.toLocaleString()}</td>
      <td>${isPareto ? '<span class="badge badge-fit-fp16">★ Pareto</span>' : '<span style="color:#64748b">—</span>'}</td>
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
