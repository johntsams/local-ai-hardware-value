# 05 — HOW PARALLELISM WORKS

## The central distinction

For one device:

- memory capacity = `C`
- local memory bandwidth = `B`

For two identical devices:

- physical memory installed = `2C`
- each device still has its own local bandwidth = `B`
- there are two local memory systems, so the **theoretical sum of local bandwidth resources** is `2B` if both are doing useful local-memory work at the same time
- the devices must communicate over a separate **interconnect**

The interconnect may be:
- NVLink
- PCIe
- ConnectX/RoCE
- Thunderbolt/JACCL
- ordinary Ethernet/network RPC

**Interconnect bandwidth is not local memory bandwidth.**

Example: an RTX A6000 has 48GB and 768 GB/s local VRAM bandwidth. NVIDIA's datasheet separately specifies up to 112.5 GB/s NVLink bandwidth between supported GPUs. Two cards therefore contain two 768 GB/s local memory systems, but their GPU-to-GPU communication path is much slower than 1,536 GB/s.

Reference:
https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/proviz-print-nvidia-rtx-a6000-datasheet-us-nvidia-1454980-r9-web%20%281%29.pdf

---

## 1. Model / capacity sharding

"Sharding" is the broad idea of splitting one model across multiple devices.

The main benefit is **model fit**.

Two 48GB devices can potentially hold roughly 96GB of model state between them, subject to:
- runtime overhead
- KV cache
- temporary buffers
- allocator behavior
- whether every byte is accelerator-addressable

This does not by itself say anything about whether single-stream inference gets 2× bandwidth.

### Project chart representation

Conservative capacity point:

`price = 2P`

`capacity = 2C`

`bandwidth term = B`

`score = (2C) × B`

This is intentionally a **capacity-first** view.

---

## 2. Pipeline parallelism / layer splitting

Pipeline parallelism usually assigns different layers/stages to different devices.

Conceptually:

Device 0:
`layers 1–20`

then activations are transferred

Device 1:
`layers 21–40`

For one simple inference stream, those stages can be substantially sequential. Therefore the existence of two B-wide memory systems does not automatically provide 2B effective bandwidth to that stream.

Pipeline parallelism is useful for fitting larger models and for structured distributed execution.

vLLM supports pipeline parallelism and tensor parallelism as separate controls.

Reference:
https://docs.vllm.ai/en/stable/serving/parallelism_scaling/

---

## 3. Tensor parallelism

Tensor parallelism splits the calculations *inside layers* across devices.

PyTorch/Torch-TensorRT describes tensor parallelism as multiple GPUs each holding slices of weight tensors and participating in collective communication such as:
- all-reduce
- all-gather
- reduce-scatter

Reference:
https://docs.pytorch.org/TensorRT/tutorials/deployment/distributed_inference.html

When both equal devices are simultaneously reading their own useful local shards, the hardware has up to:

`aggregate local memory bandwidth = 2B`

for two devices.

But this is only a **theoretical aggregate local-memory ceiling**.

Actual useful scaling is reduced by:
- collectives
- synchronization
- model architecture
- tensor-parallel degree
- batch size
- prompt/decode phase
- kernels
- communication topology
- interconnect bandwidth and latency

Therefore:

`effective TP bandwidth ≈ 2B × η`

where `η` is an empirical efficiency factor below 1 in real workloads.

The project does **not** currently assume a universal η.

---

## 4. Data parallelism

Data parallelism normally gives each worker/device a copy of the model and sends different requests/batches to different workers.

It can raise **throughput**, but does not usually make a single model able to use `2C` memory.

vLLM describes data-parallel deployments as multiple model-engine replicas processing independent batches/requests.

Reference:
https://docs.vllm.ai/en/latest/serving/data_parallel_deployment/

For this reason, data parallelism is recorded in the database but is **not** used as a model-capacity-doubling point.

---

## 5. NVLink

NVLink is an inter-GPU communication technology.

It can make multi-GPU collective communication substantially more practical than slower host-mediated paths.

It does **not**:
- increase the memory bus width on either card
- make each A6000's 768 GB/s become 1,536 GB/s
- guarantee 2× tokens/sec
- automatically turn two memory pools into one conventional hardware VRAM bus

Examples in this project with hardware NVLink support:
- RTX 2080 Ti
- TITAN RTX
- RTX 3090
- Quadro RTX 8000
- RTX A6000

NVIDIA explicitly states:
- two TITAN RTX cards can provide 48GB effective capacity through NVLink
- two Quadro RTX 8000 cards can scale capacity to 96GB
- two RTX A6000 cards can provide up to 96GB combined graphics memory

References:
https://www.nvidia.com/en-us/deep-learning-ai/products/titan-rtx.html
https://www.nvidia.com/en-au/products/workstations/quadro/rtx-8000/
https://www.nvidia.com/en-us/products/workstations/rtx-a6000/

---

## 6. PCIe-only NVIDIA multi-GPU

These project devices do not have NVLink:
- RTX 3080
- RTX 4080 / 4080 Super
- RTX 4090
- RTX 5090
- RTX PRO 6000 Blackwell Workstation Edition

That does **not** mean the second GPU's memory bus disappears.

It means multi-GPU communication uses the available PCIe/system topology and software collectives rather than NVLink.

Tensor/pipeline parallelism is still possible in appropriate CUDA/NCCL frameworks, but communication-sensitive workloads may scale worse.

vLLM parallelism reference:
https://docs.vllm.ai/en/stable/serving/parallelism_scaling/

---

## 7. DGX Spark

One DGX Spark:
- 128GB unified memory
- 273 GB/s local unified-memory bandwidth
- ConnectX-7 networking

NVIDIA documents dual-Spark and larger-model configurations.

Current NVIDIA dual-Spark vLLM documentation explicitly discusses:
- vLLM
- NCCL
- Gloo
- tensor-parallel traffic
- ConnectX-7 rails

It also explicitly warns not to interpret multiple 200,000 Mbps rails as measured aggregate serving throughput.

References:
https://docs.nvidia.com/dgx/dgx-spark/hardware.html
https://docs.nvidia.com/dgx/dgx-spark/spark-clustering.html
https://docs.nvidia.com/nemoclaw/user-guide/deepagents/inference/local-inference/set-up-vllm-on-two-dgx-sparks

So:
- two Sparks can provide 256GB aggregate physical memory
- each Spark still has its own 273 GB/s local memory system
- ConnectX carries inter-node communication
- tensor-parallel behavior is software/profile/model dependent

---

## 8. ASUS GX10

GX10 is another GB10-based 128GB system with:
- 273 GB/s local unified-memory bandwidth
- ConnectX-7
- vendor-supported dual-system stacking

ASUS documentation supports combining systems for larger models.

The database therefore marks:
- capacity sharding: yes
- multi-node: yes
- tensor-parallel: possible/software-dependent

Do not assume every NVIDIA DGX Spark software recipe automatically applies unchanged to an ASUS GX10 without checking current software compatibility.

References:
https://www.asus.com/us/networking-iot-servers/desktop-ai-supercomputer/ultra-small-ai-supercomputers/asus-ascent-gx10/
https://www.asus.com/us/support/faq/1056142/

---

## 9. Apple Mac Studio / MLX

Apple Silicon uses unified memory.

The local memory bandwidth values in this project are:
- base 36GB M4 Max configuration: 410 GB/s
- M3 Ultra: 819 GB/s

MLX supports distributed communication across physical machines.

MLX's JACCL backend provides low-latency RDMA communication over Thunderbolt and the MLX documentation specifically identifies it as useful/necessary for cases such as tensor parallelism.

MLX also includes a tensor-parallel LLM example that shards model parameters across devices.

References:
https://ml-explore.github.io/mlx/build/html/usage/distributed.html
https://ml-explore.github.io/mlx/build/html/examples/tensor_parallelism.html
https://support.apple.com/en-us/122211

Two Macs:
- remain two separate unified-memory systems
- may distribute one model
- can use tensor-parallel software paths
- do not become one native 2×-bandwidth memory bus
- communicate across Thunderbolt/JACCL rather than at local unified-memory bandwidth

---

## 10. AMD Radeon AI PRO R9700

AMD specifies:
- 32GB GDDR6
- 640 GB/s local memory bandwidth
- PCIe 5.0 x16
- ROCm support

AMD explicitly markets R9700 as supporting multi-GPU AI configurations and memory scaling.

References:
https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html
https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro.html

The database marks tensor parallelism as **software-dependent**, because exact support must be checked against the current ROCm/framework/model combination rather than inferred from the phrase "multi-GPU."

---

## 11. AMD Ryzen AI Max+ 395 / Halo

This system is different from a discrete multi-GPU workstation.

AMD documents a four-node example using Ryzen AI Max+ 395 systems and `llama.cpp` RPC to distribute a very large model across machines.

The cited example uses network communication and demonstrates **distributed model capacity**.

It does **not**, by itself, prove that the configuration is tensor parallel in the same sense as PyTorch/vLLM tensor parallelism.

Reference:
https://www.amd.com/en/developer/resources/technical-articles/2026/how-to-run-a-one-trillion-parameter-llm-locally-an-amd.html

Important memory note:
- physical system memory can be 128GB
- GPU-allocatable/dedicated amount can depend on BIOS/platform/software
- AMD examples have shown different allocations, so do not automatically treat all 128GB as dedicated accelerator VRAM

---

## 12. Modified NVIDIA cards

The project includes:
- RTX 2080 Ti 22GB
- RTX 3080 20GB
- RTX 4080 32GB
- RTX 4080 Super 32GB
- RTX 4090 48GB

These are not vendor-supported memory configurations.

Project assumption:

> If the mod changes capacity but preserves the stock memory bus width and effective memory clock, use the stock GPU's local memory bandwidth.

Do **not** infer that doubled VRAM means doubled bandwidth.

Each modded card should be verified for:
- actual memory clock
- bus width
- BIOS
- PCB design
- stability
- thermal behavior

before treating the database bandwidth as measured behavior of that exact board.

---

# What the chart should plot

## Default single-device chart
`C × B`

This is the cleanest and least ambiguous comparison.

## Conservative two-device chart
`(2C) × B`

Interpretation:
**larger-model-fit / capacity-first value**

## Optional theoretical TP chart
`(2C) × (2B)`

Interpretation:
**theoretical aggregate local-memory ceiling if both devices perform useful local work concurrently**

This point must be labeled theoretical.

It must **not** be limited to NVLink devices, because NVLink is an interconnect rather than the source of the second local memory bus.

Whether the theoretical ceiling is remotely achievable depends strongly on the communication path and software.

---

# Practical next step

For any finalists, replace theoretical scaling with actual benchmarks:
- same model
- same quantization
- same context
- same batch/concurrency
- 1× vs 2×
- prefill tokens/sec
- decode tokens/sec
- measured device memory usage
- measured interconnect utilization where possible

Only then can an empirical efficiency factor `η` be estimated.
