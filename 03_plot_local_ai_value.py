#!/usr/bin/env python3
"""
Plot the Local-AI Hardware Value database.

This script supports both legacy capacity*bandwidth charting and multi-factor weighted scoring
with system context adjustments (host platform cost for discrete GPUs and OS overhead for unified memory).

Modes
-----
singles
    One point per physical device/system:
        score = C * B  (or weighted score if configured)

capacity
    Adds a 2x capacity-sharded point for devices whose database says
    capacity sharding is supported/possible:
        price = 2P
        capacity = 2C
        bandwidth term = B
        score = (2C) * B

    This represents "fit a larger model across two devices." It does NOT say
    that the pair behaves like one memory pool with 2B bandwidth.

tp-ceiling
    Adds a theoretical tensor-parallel ceiling for rows explicitly marked
    "yes" for tensor parallelism. It does not also add the capacity-only
    squares, keeping this diagnostic chart readable:
        price = 2P
        capacity = 2C
        theoretical aggregate local BW = 2B
        score = (2C) * (2B)

    This is ONLY a ceiling for the sum of two local memory subsystems when both
    devices are actively reading useful local shards in parallel. It is NOT
    interconnect bandwidth and NOT a prediction of tokens/sec. Real scaling
    depends on communication/synchronization and should be measured.
"""

from pathlib import Path
import argparse, csv, math, random
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.ticker import FuncFormatter, NullFormatter

ROOT = Path(__file__).resolve().parent
DEFAULT_DATA = ROOT / "07_DATA" / "devices.csv"
DEFAULT_OUT = ROOT / "06_CHARTS"

PARETO = "#f28e2b"
DOMINATED = "#6b7c93"
FRONTIER = "#9c5a14"

KEEP_OUT = 22.0
PREFERRED_MAX_LEADER = 42.0
ABS_MAX_LEADER = 62.0

def truthy_support(v):
    v = (v or "").strip().lower()
    return v.startswith("yes") or v.startswith("possible")

def explicit_yes(v):
    return (v or "").strip().lower().startswith("yes")

def load_devices(path):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            d = dict(r)
            d["price_usd"] = float(d["price_usd"])
            d["memory_capacity_gb"] = float(d["memory_capacity_gb"])
            d["local_memory_bandwidth_gbs"] = float(d["local_memory_bandwidth_gbs"])
            d["fp16_tflops"] = float(d.get("fp16_tflops", 40.0) or 40.0)
            d["tensor_tflops"] = float(d.get("tensor_tflops", 120.0) or 120.0)
            d["cuda_supported"] = d.get("cuda_supported", "yes" if "NVIDIA" in d.get("vendor", "") else "no")
            d["standalone_system"] = d.get("standalone_system", "yes" if d.get("category") == "unified-memory system" else "no")
            d["modified_bool"] = d["modified"].lower() == "yes"
            rows.append(d)
    return rows

def compute_score(cap, bw, flops, is_cuda, args):
    w_mem = getattr(args, 'w_mem', 1.0)
    w_bw = getattr(args, 'w_bw', 1.0)
    w_flops = getattr(args, 'w_flops', 0.0)
    cuda_boost = getattr(args, 'cuda_boost', 1.0) if is_cuda else 1.0
    
    if w_flops == 0.0 and cuda_boost == 1.0 and w_mem == 1.0 and w_bw == 1.0:
        return cap * bw
    
    return (cap ** w_mem) * (bw ** w_bw) * (max(1.0, flops) ** w_flops) * cuda_boost

def make_points(rows, mode, args=None):
    pts = []
    system_ctx = getattr(args, 'system_context', False) if args else False
    host_cost = getattr(args, 'host_cost', 650.0) if args else 650.0
    os_overhead = getattr(args, 'mac_os_overhead', 8.0) if args else 8.0
    tp_eff = getattr(args, 'tp_eff', 1.0) if args else 1.0

    for d in rows:
        is_discrete = d["category"] == "discrete GPU"
        is_unified = d["category"] == "unified-memory system"
        is_cuda = d.get("cuda_supported") == "yes" or "NVIDIA" in d.get("vendor", "")

        base_price = (d["price_usd"] + host_cost) if (system_ctx and is_discrete) else d["price_usd"]
        base_cap = max(2.0, d["memory_capacity_gb"] - os_overhead) if (system_ctx and is_unified) else d["memory_capacity_gb"]
        base_bw = d["local_memory_bandwidth_gbs"]
        base_flops = d["fp16_tflops"]

        base = dict(d)
        base["point_id"] = d["id"]
        base["config"] = "single"
        base["plot_price"] = base_price
        base["plot_capacity"] = base_cap
        base["plot_bw"] = base_bw
        base["plot_flops"] = base_flops
        base["score"] = compute_score(base_cap, base_bw, base_flops, is_cuda, args)
        pts.append(base)

        if mode == "capacity" and truthy_support(d["capacity_sharding"]):
            x = dict(d)
            x["point_id"] = d["id"] + "_2x_capacity"
            x["config"] = "2x_capacity"
            x["plot_price"] = 2 * base_price
            x["plot_capacity"] = 2 * base_cap
            x["plot_bw"] = base_bw
            x["plot_flops"] = base_flops
            x["score"] = compute_score(2 * base_cap, base_bw, base_flops, is_cuda, args)
            pts.append(x)

        if mode == "tp-ceiling" and explicit_yes(d["tensor_parallel"]):
            x = dict(d)
            x["point_id"] = d["id"] + "_2x_tp_ceiling"
            x["config"] = "2x_tp_ceiling"
            x["plot_price"] = 2 * base_price
            x["plot_capacity"] = 2 * base_cap
            x["plot_bw"] = 2 * base_bw * tp_eff
            x["plot_flops"] = 2 * base_flops
            x["score"] = compute_score(2 * base_cap, 2 * base_bw * tp_eff, 2 * base_flops, is_cuda, args)
            pts.append(x)

    for d in pts:
        d["pareto"] = not any(
            o["point_id"] != d["point_id"]
            and o["plot_price"] <= d["plot_price"]
            and o["score"] >= d["score"]
            and (o["plot_price"] < d["plot_price"] or o["score"] > d["score"])
            for o in pts
        )
    return pts

def marker_for(d):
    unified = d["category"] == "unified-memory system"
    if d["config"] == "single":
        return "D" if unified else "o"
    if d["config"] == "2x_capacity":
        return "s"
    return "^"

def short_name(d):
    n = d["device_name"]
    n = n.replace("NVIDIA ", "").replace("Mac Studio ", "")
    n = n.replace(" (refurb reference)", "")
    if d["config"] == "single":
        return n
    if d["config"] == "2x_capacity":
        return "2× " + n + " [capacity]"
    return "2× " + n + " [TP ceiling]"

def interconnect_tag(d):
    if d["config"] == "single":
        return ""
    if d.get("nvlink") == "yes":
        return " · NVLink"
    if d.get("connectx7") == "yes":
        return " · ConnectX-7"
    if d.get("thunderbolt5") == "yes":
        return " · TB5/MLX"
    if "AMD" in d["vendor"] and d["category"] == "unified-memory system":
        return " · network/RPC"
    return " · PCIe/software"

def label_text(d, args=None):
    p = d["plot_price"]
    c = d["plot_capacity"]
    b = d["plot_bw"]
    quality = "†" if str(d.get("price_quality", "")).startswith("low") else ""
    if d["config"] == "2x_tp_ceiling":
        bwline = f"{b:,.0f} GB/s aggregate-local ceiling"
    else:
        bwline = f"{b:,.1f}".rstrip("0").rstrip(".") + " GB/s"
    
    score_unit = "Score" if (args and (getattr(args, 'w_flops', 0) > 0 or getattr(args, 'cuda_boost', 1) > 1)) else "GB²/s"
    return (
        f"{short_name(d)}{interconnect_tag(d)}\n"
        f"${p:,.0f}{quality} · {c:,.0f} GB · {bwline}\n"
        f"{d['score']:,.0f} {score_unit}"
    )

def rect_overlap(a,b,pad=0):
    return not (a[2]+pad <= b[0] or a[0]-pad >= b[2] or
                a[3]+pad <= b[1] or a[1]-pad >= b[3])

def point_in_rect(p,r,pad=0):
    return r[0]-pad <= p[0] <= r[2]+pad and r[1]-pad <= p[1] <= r[3]+pad

def orient(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])

def proper_intersect(a,b,c,d,eps=1e-9):
    o1,o2,o3,o4=orient(a,b,c),orient(a,b,d),orient(c,d,a),orient(c,d,b)
    return o1*o2 < -eps and o3*o4 < -eps

def seg_hits_rect(a,b,r,pad=0):
    rr=[r[0]-pad,r[1]-pad,r[2]+pad,r[3]+pad]
    if point_in_rect(a,rr) or point_in_rect(b,rr):
        return True
    cs=[(rr[0],rr[1]),(rr[2],rr[1]),(rr[2],rr[3]),(rr[0],rr[3])]
    return any(proper_intersect(a,b,c,d) for c,d in zip(cs,cs[1:]+cs[:1]))

def point_seg_distance(q,a,b):
    q=np.asarray(q); a=np.asarray(a); b=np.asarray(b)
    v=b-a; den=np.dot(v,v)
    if den == 0: return np.linalg.norm(q-a)
    t=np.clip(np.dot(q-a,v)/den,0,1)
    return np.linalg.norm(q-(a+t*v))

def rect_circle_overlap(rect,c,r):
    x=min(max(c[0],rect[0]),rect[2])
    y=min(max(c[1],rect[1]),rect[3])
    return (x-c[0])**2+(y-c[1])**2 < r*r

def segment_circle_overlap(a,b,c,r):
    return point_seg_distance(c,a,b) < r

def nearest_point_on_rect(p,r):
    return np.array([min(max(p[0],r[0]),r[2]),min(max(p[1],r[1]),r[3])],float)

def ray_circle_exit(c,toward,r):
    v=np.asarray(toward)-np.asarray(c)
    L=np.linalg.norm(v)
    return np.asarray(c) if L == 0 else np.asarray(c)+v/L*r

def circular_diff(a,b):
    return abs(math.atan2(math.sin(a-b),math.cos(a-b)))

def dollars(x,pos=None):
    if x >= 1000:
        s = f"${x/1000:.1f}k"
        return s.replace(".0k","k")
    return f"${x:,.0f}"

def yfmt(x,pos=None):
    if x >= 1_000_000:
        return f"{x/1_000_000:g}M"
    return f"{x/1000:g}k"

def choose_labels(ax, fig, points, legend, fontsize=7.5, args=None):
    fig.canvas.draw()
    renderer=fig.canvas.get_renderer()
    ab=ax.get_window_extent(renderer)
    inner=np.array([ab.x0+10,ab.y0+10,ab.x1-10,ab.y1-10])
    lb=legend.get_window_extent(renderer)
    legend_box=np.array([lb.x0-7,lb.y0-7,lb.x1+7,lb.y1+7])

    pix={d["point_id"]:ax.transData.transform((d["plot_price"],d["score"])) for d in points}

    sizes={}
    temps=[]
    for d in points:
        t=ax.annotate(label_text(d, args),xy=(d["plot_price"],d["score"]),
                      xytext=(d["plot_price"],d["score"]),
                      fontsize=fontsize,ha="center",va="center",
                      bbox=dict(boxstyle="round,pad=0.22",fc="white",ec=".78",alpha=.96))
        temps.append(t)
    fig.canvas.draw()
    for d,t in zip(points,temps):
        bb=t.get_bbox_patch().get_window_extent(renderer)
        sizes[d["point_id"]] = (bb.width,bb.height)
        t.remove()

    def box(uid,c,pad=3):
        w,h=sizes[uid]
        return np.array([c[0]-w/2-pad,c[1]-h/2-pad,c[0]+w/2+pad,c[1]+h/2+pad])

    angles=list(range(0,360,22))
    gaps=[8,14,22,32,45,60]
    cand={}
    unary={}

    for d in points:
        uid=d["point_id"]; p=pix[uid]; w,h=sizes[uid]
        raw=[]; costs=[]
        for gap in gaps:
            for deg in angles:
                th=math.radians(deg)
                u=np.array([math.cos(th),math.sin(th)])
                support=abs(u[0])*(w/2+3)+abs(u[1])*(h/2+3)
                center=p+u*(KEEP_OUT+gap+support)
                r=box(uid,center,3)
                end=nearest_point_on_rect(p,r)
                start=ray_circle_exit(p,end,KEEP_OUT)
                L=np.linalg.norm(end-start)
                if L > ABS_MAX_LEADER: continue
                if r[0]<inner[0] or r[1]<inner[1] or r[2]>inner[2] or r[3]>inner[3]: continue
                if rect_overlap(r,legend_box,pad=4): continue
                if any(rect_circle_overlap(r,q,KEEP_OUT) for q in pix.values()): continue
                if any(oid!=uid and segment_circle_overlap(start,end,q,KEEP_OUT)
                       for oid,q in pix.items()): continue

                own=np.linalg.norm(end-p)
                wrong=min(np.linalg.norm(end-q) for oid,q in pix.items() if oid!=uid)
                margin=wrong-own
                if margin < 4: continue

                length_cost=14*L+2.2*max(0,L-PREFERRED_MAX_LEADER)**2
                clarity_cost=1.3*max(0,28-margin)**2
                raw.append(dict(center=center,rect=r,start=start,end=end,len=L,angle=th,margin=margin))
                costs.append(length_cost+clarity_cost)

        if not raw:
            for gap in (72, 90, 115, 140, 170):
                for deg in range(0, 360, 15):
                    th = math.radians(deg)
                    u = np.array([math.cos(th), math.sin(th)])
                    support = abs(u[0]) * (w / 2 + 3) + abs(u[1]) * (h / 2 + 3)
                    center = p + u * (KEEP_OUT + gap + support)
                    r = box(uid, center, 2)
                    end = nearest_point_on_rect(p, r)
                    start = ray_circle_exit(p, end, KEEP_OUT)
                    L = np.linalg.norm(end - start)
                    if L > 180: continue
                    if r[0] < inner[0] or r[1] < inner[1] or r[2] > inner[2] or r[3] > inner[3]: continue
                    if rect_overlap(r, legend_box, pad=2): continue
                    if any(rect_circle_overlap(r, q, KEEP_OUT * 0.7) for q in pix.values() if not np.array_equal(q, p)): continue
                    own = np.linalg.norm(end - p)
                    wrong = min((np.linalg.norm(end - q) for oid, q in pix.items() if oid != uid), default=999)
                    margin = wrong - own
                    length_cost = 14 * L + 25 * max(0, L - ABS_MAX_LEADER) ** 2
                    clarity_cost = 1.3 * max(0, 28 - margin) ** 2
                    raw.append(dict(center=center, rect=r, start=start, end=end, len=L, angle=th, margin=margin))
                    costs.append(length_cost + clarity_cost + 50000)

        if not raw:
            # Ultimate emergency placement directly above/below
            center = p + np.array([0, 35 if p[1] < inner[3] - 50 else -35])
            r = box(uid, center, 2)
            end = nearest_point_on_rect(p, r)
            start = ray_circle_exit(p, end, 10)
            raw.append(dict(center=center, rect=r, start=start, end=end, len=35, angle=0, margin=10))
            costs.append(100000)

        order=np.argsort(costs)
        keep=[]; kc=[]
        for idx in order:
            c=raw[idx]
            if all(np.linalg.norm(c["center"]-k["center"])>17 for k in keep):
                keep.append(c); kc.append(costs[idx])
            if len(keep)>=30: break
        cand[uid]=keep
        unary[uid]=np.asarray(kc)

    uids=[d["point_id"] for d in points]
    pair={}
    near=set()
    for i,a in enumerate(uids):
        for b in uids[i+1:]:
            if np.linalg.norm(pix[a]-pix[b])<220:
                near.add((a,b))

    for ia,a in enumerate(uids):
        A=cand[a]
        for b in uids[ia+1:]:
            B=cand[b]
            M=np.zeros((len(A),len(B)))
            isnear=(a,b) in near
            for i,ca in enumerate(A):
                for j,cb in enumerate(B):
                    c=0.0
                    if rect_overlap(ca["rect"],cb["rect"],pad=5): c+=2_500_000
                    if seg_hits_rect(ca["start"],ca["end"],cb["rect"],pad=2): c+=1_500_000
                    if seg_hits_rect(cb["start"],cb["end"],ca["rect"],pad=2): c+=1_500_000
                    if proper_intersect(ca["start"],ca["end"],cb["start"],cb["end"]): c+=900_000
                    if isnear: c+=14*circular_diff(ca["angle"],cb["angle"])
                    M[i,j]=c
            pair[(a,b)]=M

    def pm(a,b):
        if (a,b) in pair: return pair[(a,b)],False
        return pair[(b,a)],True

    def lv(uid,assign):
        v=unary[uid].copy()
        for o in uids:
            if o==uid: continue
            M,tr=pm(uid,o); oi=assign[o]
            v += M[oi,:] if tr else M[:,oi]
        return v

    def tc(assign):
        c=sum(unary[u][assign[u]] for u in uids)
        for i,a in enumerate(uids):
            for b in uids[i+1:]:
                M,_=pm(a,b)
                c+=M[assign[a],assign[b]]
        return float(c)

    rng=random.Random(71)
    best=None; bestc=float("inf")
    for restart in range(16):
        assign={u:(0 if restart==0 else rng.randrange(min(6,len(cand[u])))) for u in uids}
        for sweep in range(90):
            changed=False
            burden=[]
            for u in uids:
                vv=lv(u,assign)
                burden.append((float(vv[assign[u]]-unary[u][assign[u]]),u))
            order=[u for _,u in sorted(burden,reverse=True)]
            for u in order:
                vals=lv(u,assign)
                if restart>0 and sweep<15:
                    vals=vals+np.array([rng.random()*50 for _ in vals])
                j=int(np.argmin(vals))
                if j!=assign[u]:
                    assign[u]=j; changed=True
            if not changed: break
        c=tc(assign)
        if c<bestc:
            bestc=c; best=dict(assign)

    return {u:cand[u][best[u]] for u in uids}

def plot(rows, mode, output, args=None):
    points=make_points(rows,mode,args)

    if mode == "singles":
        figsize=(27,17)
    else:
        figsize=(36,22)
    fig,ax=plt.subplots(figsize=figsize,dpi=170)
    eff=sorted([d for d in points if d["pareto"]],key=lambda d:d["plot_price"])
    ax.plot([d["plot_price"] for d in eff],[d["score"] for d in eff],
            color=FRONTIER,lw=2.4,zorder=1)

    for d in points:
        ax.scatter(d["plot_price"],d["score"],s=125,marker=marker_for(d),
                   facecolor=PARETO if d["pareto"] else DOMINATED,
                   edgecolor="black",linewidth=.9,zorder=4)

    ax.set_xscale("log"); ax.set_yscale("log")
    xs=[d["plot_price"] for d in points]; ys=[d["score"] for d in points]
    ax.set_xlim(min(xs)/1.25,max(xs)*1.45)
    ax.set_ylim(min(ys)/1.25,max(ys)*1.55)
    
    sys_ctx_str = " (System Context Active: +Host Cost & -OS RAM)" if (args and getattr(args, 'system_context', False)) else ""
    title = {
        "singles": f"Local-AI hardware value — single devices{sys_ctx_str}",
        "capacity": f"Local-AI hardware value — singles + 2× capacity-sharded{sys_ctx_str}",
        "tp-ceiling": f"Local-AI hardware value — includes theoretical 2× TP ceiling{sys_ctx_str}",
    }[mode]
    ax.set_title(title,fontsize=20,pad=18)
    
    xlabel = "Total System Purchase Price (USD, log scale)" if (args and getattr(args, 'system_context', False)) else "Purchase price (USD, log scale)"
    ax.set_xlabel(xlabel, fontsize=12.5)
    
    if args and (getattr(args, 'w_flops', 0) > 0 or getattr(args, 'cuda_boost', 1) > 1):
        ylabel = f"Multi-factor weighted value score (C^{args.w_mem} × B^{args.w_bw} × T^{args.w_flops} × CUDA, log scale)"
    elif mode=="tp-ceiling":
        ylabel="Memory capacity × plotted local-memory-bandwidth term (GB²/s, log scale)"
    else:
        ylabel="Memory capacity × per-device local memory bandwidth (GB²/s, log scale)"
        
    ax.set_ylabel(ylabel,fontsize=12.5)
    ax.xaxis.set_major_formatter(FuncFormatter(dollars))
    ax.xaxis.set_minor_formatter(NullFormatter())
    ax.yaxis.set_major_formatter(FuncFormatter(yfmt))
    ax.yaxis.set_minor_formatter(NullFormatter())
    ax.grid(True,alpha=.18,which="major")
    ax.grid(True,alpha=.05,which="minor")
    ax.tick_params(axis="both",labelsize=10.5)

    handles=[
        Line2D([0],[0],marker="o",ls="None",mfc="none",mec="black",markersize=9,label="Single discrete GPU"),
        Line2D([0],[0],marker="D",ls="None",mfc="none",mec="black",markersize=9,label="Single unified-memory system"),
    ]
    if mode == "capacity":
        handles.append(Line2D([0],[0],marker="s",ls="None",mfc="none",mec="black",markersize=9,label="2× capacity-sharded"))
    if mode=="tp-ceiling":
        handles.append(Line2D([0],[0],marker="^",ls="None",mfc="none",mec="black",markersize=9,label="2× TP theoretical aggregate-local-BW ceiling"))
    handles += [
        Line2D([0],[0],marker="o",ls="None",mfc=PARETO,mec="black",markersize=9,label="Pareto-efficient"),
        Line2D([0],[0],marker="o",ls="None",mfc=DOMINATED,mec="black",markersize=9,label="Dominated"),
        Line2D([0],[0],color=FRONTIER,lw=2.4,label="Pareto frontier"),
    ]
    legend=ax.legend(handles=handles,loc="upper left",fontsize=12.5,borderpad=1.0,labelspacing=.65)
    fig.subplots_adjust(left=.07,right=.99,top=.925,bottom=.15)

    label_font = 7.8 if mode == "singles" else 6.45
    chosen=choose_labels(ax,fig,points,legend,fontsize=label_font,args=args)
    for d in points:
        c=chosen[d["point_id"]]
        sd=ax.transData.inverted().transform(c["start"])
        ed=ax.transData.inverted().transform(c["end"])
        cd=ax.transData.inverted().transform(c["center"])
        ax.plot([sd[0],ed[0]],[sd[1],ed[1]],color=".42",lw=.75,zorder=2)
        ax.annotate(label_text(d, args),xy=(d["plot_price"],d["score"]),xytext=cd,
                    textcoords="data",ha="center",va="center",
                    fontsize=label_font,
                    bbox=dict(boxstyle="round,pad=0.22",fc="white",ec=".78",alpha=.96),
                    zorder=5)

    if args and getattr(args, 'system_context', False):
        footer = f"System Context Active: Discrete GPUs include +${args.host_cost:,.0f} host cost; Unified systems deduct {args.mac_os_overhead:g}GB OS RAM. Prices/specs are time-sensitive."
    elif mode=="singles":
        footer="† = price row marked low-current confidence / historical in database. Prices are time-sensitive."
    elif mode=="capacity":
        footer=("2× capacity point: price=2P, capacity=2C, bandwidth term=B. "
                "Interconnect tags describe communication path; they do NOT double local memory bandwidth.")
    else:
        footer=("TP triangles are theoretical ceilings: capacity=2C and aggregate local BW=2B only if both devices "
                "do useful local-memory work concurrently. They are not measured performance and not interconnect bandwidth.")

    fig.text(.5,.045,footer,ha="center",va="bottom",fontsize=8.7)
    output=Path(output)
    output.parent.mkdir(parents=True,exist_ok=True)
    fig.savefig(output,bbox_inches="tight")
    plt.close(fig)
    print(output)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--data",default=str(DEFAULT_DATA))
    ap.add_argument("--mode",choices=["singles","capacity","tp-ceiling"],default="singles")
    ap.add_argument("--output",default=None)
    ap.add_argument("--system-context",action="store_true",help="Account for host platform cost on discrete GPUs and OS RAM overhead on unified memory")
    ap.add_argument("--host-cost",type=float,default=650.0,help="Host platform cost for discrete GPUs (default: $650)")
    ap.add_argument("--mac-os-overhead",type=float,default=8.0,help="RAM reserved for OS on unified systems (default: 8GB)")
    ap.add_argument("--w-mem",type=float,default=1.0,help="Memory capacity weight exponent (default: 1.0)")
    ap.add_argument("--w-bw",type=float,default=1.0,help="Memory bandwidth weight exponent (default: 1.0)")
    ap.add_argument("--w-flops",type=float,default=0.0,help="Compute FP16 TFLOPS weight exponent (default: 0.0 for legacy C*B)")
    ap.add_argument("--cuda-boost",type=float,default=1.0,help="NVIDIA CUDA software ecosystem efficiency multiplier (default: 1.0 for legacy)")
    ap.add_argument("--tp-eff",type=float,default=1.0,help="Tensor parallel efficiency factor (default: 1.0)")
    args=ap.parse_args()
    
    out = args.output
    if out is None:
        suffix = "_system_context" if args.system_context else ""
        out = DEFAULT_OUT / {
            "singles": f"02_single_device_current_data{suffix}.png",
            "capacity": f"03_capacity_sharded_current_data{suffix}.png",
            "tp-ceiling": f"04_tp_theoretical_ceiling{suffix}.png",
        }[args.mode]
        
    plot(load_devices(args.data),args.mode,out,args)

if __name__=="__main__":
    main()
