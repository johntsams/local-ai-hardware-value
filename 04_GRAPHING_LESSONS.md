# 04 — GRAPHING LESSONS LEARNED

This file is deliberately about **graph construction and label layout**, not hardware parallelism.

## 1. Use log X and log Y for the all-in-one chart

Price and the memory-capacity × bandwidth score span more than an order of magnitude.

A linear price axis compressed nearly every practical option into the left side of the chart and forced labels into a dense forest.

Use:
- X = purchase price, **log scale**
- Y = memory capacity × bandwidth score, **log scale**

Keep exact price and score inside each label.

## 2. Hard-coded annotation offsets are brittle

Manual `(dx, dy)` offsets broke as soon as:
- prices changed
- points were added
- label text changed
- axis limits changed

Use generated candidate placements instead.

## 3. Measure the actual rendered text box

Do not guess label width/height.

With Matplotlib, measure the actual bbox patch after drawing:

`annotation.get_bbox_patch().get_window_extent(renderer)`

Using the full annotation extent can accidentally include leader geometry and create false collision reports.

## 4. Every plotted point needs a unique internal ID

Several M3 Ultra configurations have similar visible names.

Display names can repeat. Optimizer keys cannot.

## 5. Treat each marker as a protected obstacle

This was the biggest improvement.

Each point gets a circular **keep-out zone**.

Rules:
- no other label box may enter it
- no other leader line may enter it
- the point's own leader starts at the keep-out boundary rather than the marker center

Current preferred keep-out radius: approximately **22–23 rendered pixels**.

## 6. Generate finite callout candidates

For each point:
- generate placements in a finite set of directions
- use several small distance rings
- build the corresponding label rectangle
- compute the shortest leader from the keep-out boundary to the nearest label edge

Reject illegal candidates before global optimization.

## 7. Hard constraints first

Reject a candidate if it:
- exits the axes
- overlaps the legend
- covers any marker keep-out
- sends a leader through another marker keep-out
- causes label overlap
- sends a leader through another label
- creates a leader/leader crossing

Important semantic lines such as the Pareto frontier should also be treated as obstacles/routing barriers when practical.

## 8. Then optimize leader length

Once geometry is legal, short leaders matter a lot.

The best previous layout achieved roughly:
- median leader ≈ **9.6 px**
- mean leader ≈ **11.8 px**
- maximum leader ≈ **39 px**
- zero detected overlaps/crossings/keep-out violations

Preferred design target:
- preferred max leader ≈ **42 px**
- normal hard target ≈ **62 px**

The portable plotting script has a farther emergency fallback for exceptionally dense charts so it does not crash. That fallback is a portability measure, not the preferred aesthetic.

## 9. Optimize ownership clarity, not only collision freedom

A chart can have zero crossings and still be confusing.

For a label's attachment point:
- compute distance to its own marker
- compute distance to the nearest wrong marker
- reward a large difference

Conceptually:

`clarity margin = nearest_wrong_distance - own_distance`

A label that is almost equally plausible for two nearby points should be penalized even if nothing overlaps.

## 10. Dense cluster bundling is optional, not automatic

We tested ordered label stacks:
- top point → top label
- middle point → middle label
- bottom point → bottom label

This improved ownership but sometimes created long, awkward leaders.

Final lesson:
- start with independent short callouts
- detect only genuinely ambiguous micro-clusters
- try partial/full ordered bundles
- heavily penalize the **worst** leader
- accept the bundle only if it improves clarity enough to justify the extra distance

Often the correct result is **no bundle**.

## 11. Penalize max leader length, not just total leader length

Minimizing only total length can allow one terrible outlier.

Use an objective containing both:
- sum of leader lengths
- maximum leader length

The maximum should have substantial weight.

## 12. Leave explicit room for title, axes and footer

Earlier versions clipped:
- x-axis labels
- explanatory footer text

Reserve margins explicitly with `subplots_adjust(...)`.

## 13. Validate automatically and inspect visually

Required workflow:
1. render
2. measure actual geometry
3. run overlap/crossing/keep-out checks
4. save PNG
5. visually inspect the actual PNG
6. reject/revise if it still looks confusing

Automated geometry cannot fully judge visual ownership or elegance.

## 14. Legend semantics must stay stable

Current intended semantics:
- circle = single discrete GPU
- diamond = single unified-memory system
- square = 2× capacity-sharded
- triangle = optional 2× tensor-parallel theoretical ceiling
- orange = Pareto-efficient
- blue-gray = dominated
- brown line = Pareto frontier

**Interconnect technology should be text/metadata, not a marker that implies bandwidth scaling.**

That corrects an earlier design where triangles meant NVLink/ConnectX-linked systems and could be misread as "bandwidth doubled."

## 15. The chart heuristic is not a benchmark

`capacity × bandwidth` intentionally rewards:
- more memory
- faster memory

It does not include:
- compute throughput
- quantization support
- kernel maturity
- prompt length effects
- KV-cache behavior
- interconnect overhead
- software quality
- measured tokens/sec

Use it as a memory-centric value map, then benchmark finalists.
