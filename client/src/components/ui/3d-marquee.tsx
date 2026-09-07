"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Plus, FolderKanban, ArrowRight, CheckCircle2 } from "lucide-react";

export interface MarqueeItem {
  id?: string | number;
  type: "project" | "feature";
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  projectId?: number;
  progress?: number;
  taskCount?: number;
}

interface ThreeDMarqueeProps {
  items?: MarqueeItem[];
  images?: string[];
  className?: string;
  onSelectImage?: (image: string, title: string) => void;
  onSelectProject?: (projectId: number) => void;
  onSelectItem?: (item: MarqueeItem) => void;
}

export function extractTitle(url: string): string {
  try {
    const filename = url.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Design";
    return filename
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/Cloudinary Bkp\s*/i, "")
      .replace(/\s*[a-z0-9]{6,}$/i, "");
  } catch {
    return "Design Component";
  }
}

export function ThreeDMarquee({
  items,
  images,
  className,
  onSelectImage,
  onSelectProject,
  onSelectItem,
}: ThreeDMarqueeProps) {
  // Build unified item list: support both explicit items and image array
  const allItems: MarqueeItem[] =
    items && items.length > 0
      ? items
      : (images || []).map((img, i) => ({
          id: i,
          type: "feature" as const,
          title: extractTitle(img),
          image: img,
          badge: "Feature",
        }));

  // Divide items into 4 columns
  const columnCount = 4;
  const columns: MarqueeItem[][] = Array.from({ length: columnCount }, () => []);

  allItems.forEach((item, idx) => {
    columns[idx % columnCount].push(item);
  });

  return (
    <div
      className={cn(
        "relative h-[36rem] sm:h-[42rem] w-full overflow-hidden rounded-3xl bg-[#09090b]/80 border border-white/10",
        className
      )}
      style={{ perspective: 1200 }}
    >
      {/* Top and Bottom gradient vignettes for smooth fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#09090b] via-[#09090b]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-[#09090b] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-[#09090b] to-transparent" />

      {/* 3D Tilted Marquee Stage */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
        style={{
          transform: "rotateX(48deg) rotateZ(-32deg) skewX(6deg) scale(0.95)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="flex gap-5 sm:gap-7 w-[160%] max-w-none justify-center">
          {columns.map((colItems, colIdx) => {
            // Duplicate column items for seamless infinite scroll
            const duplicated = [...colItems, ...colItems, ...colItems];
            const isReverse = colIdx % 2 === 1;
            const duration = 38 + colIdx * 6;

            return (
              <motion.div
                key={colIdx}
                className="flex flex-col gap-5 sm:gap-7 shrink-0 w-64 sm:w-72"
                animate={{
                  y: isReverse ? ["-50%", "0%"] : ["0%", "-50%"],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: duration,
                  ease: "linear",
                }}
                whileHover={{ animationPlayState: "paused" }}
              >
                {duplicated.map((item, i) => {
                  const isProject = item.type === "project";

                  function handleClick() {
                    onSelectItem?.(item);
                    if (isProject && item.projectId && onSelectProject) {
                      onSelectProject(item.projectId);
                    } else if (onSelectImage) {
                      onSelectImage(item.image, item.title);
                    }
                  }

                  return (
                    <motion.div
                      key={i}
                      onClick={handleClick}
                      whileHover={{ scale: 1.05, y: -4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-2xl border p-3 shadow-2xl backdrop-blur-xl transition-all",
                        isProject
                          ? "border-cyan-500/30 bg-[#10141d]/95 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]"
                          : "border-white/10 bg-[#121318]/90 hover:border-brand-2/60 hover:shadow-[0_0_30px_var(--color-brand-glow)]"
                      )}
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/40">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                          {isProject ? (
                            <span className="flex items-center gap-1 rounded-full bg-cyan-500/25 border border-cyan-400/40 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-200 backdrop-blur-md shadow-sm">
                              <FolderKanban className="h-3 w-3 text-cyan-300" />
                              Project
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-purple-500/25 border border-purple-400/40 px-2.5 py-0.5 text-[10px] font-semibold text-purple-200 backdrop-blur-md shadow-sm">
                              <Sparkles className="h-3 w-3 text-purple-300" />
                              {item.badge || "Feature"}
                            </span>
                          )}

                          {isProject && item.progress !== undefined && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold backdrop-blur-md border",
                                item.progress === 100
                                  ? "bg-emerald-500/25 border-emerald-400/40 text-emerald-300"
                                  : "bg-black/60 border-white/15 text-white/90"
                              )}
                            >
                              {item.progress}%
                            </span>
                          )}
                        </div>

                        {/* Hover Action Pill */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                          {isProject ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-black shadow-lg">
                              <ArrowRight className="h-3.5 w-3.5" />
                              Open Project
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-black shadow-lg">
                              <Plus className="h-3.5 w-3.5" />
                              Add to Project
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Title & Subtitle / Feature details */}
                      <div className="mt-2.5 px-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs sm:text-sm font-bold text-white group-hover:text-brand-2 transition-colors">
                            {item.title}
                          </p>
                          {isProject && item.progress === 100 && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="mt-0.5 truncate text-[11px] text-white/50">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
