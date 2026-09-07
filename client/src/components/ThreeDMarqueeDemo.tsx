"use client";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDMarquee, type MarqueeItem } from "@/components/ui/3d-marquee";
import { useProjects } from "@/hooks/useProjects";

export const MARQUEE_IMAGES = [
  "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
  "https://assets.aceternity.com/animated-modal.png",
  "https://assets.aceternity.com/animated-testimonials.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
  "https://assets.aceternity.com/github-globe.png",
  "https://assets.aceternity.com/glare-card.png",
  "https://assets.aceternity.com/layout-grid.png",
  "https://assets.aceternity.com/flip-text.png",
  "https://assets.aceternity.com/hero-highlight.png",
  "https://assets.aceternity.com/carousel.webp",
  "https://assets.aceternity.com/placeholders-and-vanish-input.png",
  "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
  "https://assets.aceternity.com/signup-form.png",
  "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
  "https://assets.aceternity.com/spotlight-new.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
  "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
  "https://assets.aceternity.com/tabs.png",
  "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
  "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
  "https://assets.aceternity.com/glowing-effect.webp",
  "https://assets.aceternity.com/hover-border-gradient.png",
  "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
  "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
  "https://assets.aceternity.com/macbook-scroll.png",
  "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
  "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
  "https://assets.aceternity.com/multi-step-loader.png",
  "https://assets.aceternity.com/vortex.png",
  "https://assets.aceternity.com/wobble-card.png",
  "https://assets.aceternity.com/world-map.webp",
];

export const FLOWBOARD_FEATURES: {
  title: string;
  subtitle: string;
  badge: string;
  image: string;
}[] = [
  {
    title: "Interactive Kanban Board",
    subtitle: "Drag & drop status columns with fluid spring physics",
    badge: "Kanban",
    image: "https://assets.aceternity.com/layout-grid.png",
  },
  {
    title: "Instant ⌘K Command Palette",
    subtitle: "Global keyboard search for projects, tasks & actions",
    badge: "Quick Actions",
    image: "https://assets.aceternity.com/placeholders-and-vanish-input.png",
  },
  {
    title: "Dynamic Lighting & Themes",
    subtitle: "Hot-swap between Cyber Violet, Cyan, Emerald & Crimson",
    badge: "Theme Engine",
    image: "https://assets.aceternity.com/glowing-effect.webp",
  },
  {
    title: "Interactive 3D Grid Canvas",
    subtitle: "Cursor-reactive neon grid with vibrant hover reflections",
    badge: "Visual FX",
    image: "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
  },
  {
    title: "Real-time Velocity & Progress",
    subtitle: "Instant task completion tracking and radial metrics",
    badge: "Analytics",
    image: "https://assets.aceternity.com/carousel.webp",
  },
  {
    title: "Smart Priority & Due Date Alerts",
    subtitle: "Urgency badges and automated overdue countdowns",
    badge: "Deadlines",
    image: "https://assets.aceternity.com/hover-border-gradient.png",
  },
  {
    title: "Milestone Confetti Celebrations",
    subtitle: "Rewarding full-canvas particle bursts on project finish",
    badge: "Gamification",
    image: "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
  },
  {
    title: "Offline Guest & Supabase Sync",
    subtitle: "Instant local persistence with seamless cloud database sync",
    badge: "Data Sync",
    image: "https://assets.aceternity.com/github-globe.png",
  },
  {
    title: "Dedicated Feature Column",
    subtitle: "Track UI design specs and roadmap items directly in boards",
    badge: "Workflow",
    image: "https://assets.aceternity.com/tabs.png",
  },
  {
    title: "Collaborator Invites & Roles",
    subtitle: "Invite teammates by email with Owner & Member controls",
    badge: "Teamwork",
    image: "https://assets.aceternity.com/animated-testimonials.webp",
  },
  {
    title: "3D Isometric Viewport Engine",
    subtitle: "Hardware-accelerated perspective marquee for workspaces",
    badge: "3D Showcase",
    image: "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
  },
  {
    title: "Glassmorphic Dark UI",
    subtitle: "Backdrop blur, mouse-following glare and sleek aesthetics",
    badge: "Design System",
    image: "https://assets.aceternity.com/glare-card.png",
  },
  {
    title: "Sprint & Milestone Tracking",
    subtitle: "Structure deliverables into clear release milestones",
    badge: "Roadmap",
    image: "https://assets.aceternity.com/macbook-scroll.png",
  },
  {
    title: "Multi-Attribute Task Search",
    subtitle: "Real-time filtering across status, priority, and assignees",
    badge: "Filter & Search",
    image: "https://assets.aceternity.com/flip-text.png",
  },
  {
    title: "Role-Based Access Control",
    subtitle: "Fine-grained permissions for project creators and members",
    badge: "Security",
    image: "https://assets.aceternity.com/signup-form.png",
  },
  {
    title: "Tactile Micro-Interactions",
    subtitle: "Spring-based hover gestures and fluid motion feedback",
    badge: "User Experience",
    image: "https://assets.aceternity.com/spotlight-new.webp",
  },
];

interface ThreeDMarqueeDemoProps {
  onSelectDesign?: (image: string, title: string) => void;
  onSelectProject?: (projectId: number) => void;
}

export function ThreeDMarqueeDemo({
  onSelectDesign,
  onSelectProject,
}: ThreeDMarqueeDemoProps) {
  const { data: projects } = useProjects();
  const navigate = useNavigate();

  const marqueeItems = useMemo(() => {
    const items: MarqueeItem[] = [];

    // 1. Projects Cards (Display user project names prominently)
    const projectCards: MarqueeItem[] = (projects || []).map((p, idx) => ({
      id: `proj-${p.id}`,
      type: "project" as const,
      title: p.name,
      subtitle: `${p.taskCount} tasks • ${p.progress}% completed`,
      badge: p.progress === 100 ? "Completed" : "Active Project",
      image: MARQUEE_IMAGES[idx % MARQUEE_IMAGES.length],
      projectId: p.id,
      progress: p.progress,
      taskCount: p.taskCount,
    }));

    // If no projects exist yet, add sample initiative projects so project names are visible
    if (projectCards.length === 0) {
      projectCards.push(
        {
          id: "sample-1",
          type: "project" as const,
          title: "E-Commerce Experience",
          subtitle: "12 tasks • 68% completed",
          badge: "Active Project",
          image: "https://assets.aceternity.com/macbook-scroll.png",
          progress: 68,
          taskCount: 12,
        },
        {
          id: "sample-2",
          type: "project" as const,
          title: "Design System 2.0",
          subtitle: "8 tasks • 100% completed",
          badge: "Completed",
          image: "https://assets.aceternity.com/spotlight-new.webp",
          progress: 100,
          taskCount: 8,
        },
        {
          id: "sample-3",
          type: "project" as const,
          title: "Mobile App Rebrand",
          subtitle: "15 tasks • 45% completed",
          badge: "Active Project",
          image: "https://assets.aceternity.com/vortex.png",
          progress: 45,
          taskCount: 15,
        }
      );
    }

    // 2. Feature Cards (Display website features)
    const featureCards: MarqueeItem[] = FLOWBOARD_FEATURES.map((f, idx) => ({
      id: `feat-${idx}`,
      type: "feature" as const,
      title: f.title,
      subtitle: f.subtitle,
      badge: f.badge,
      image: f.image,
    }));

    // Interleave projects and features evenly across the columns
    const maxLen = Math.max(projectCards.length, featureCards.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < projectCards.length) {
        items.push(projectCards[i]);
      }
      if (i < featureCards.length) {
        items.push(featureCards[i]);
      }
    }

    // Fill remaining slots from extra features if needed
    if (items.length < 16) {
      FLOWBOARD_FEATURES.forEach((f, idx) => {
        if (!items.some((it) => it.title === f.title)) {
          items.push({
            id: `extra-feat-${idx}`,
            type: "feature" as const,
            title: f.title,
            subtitle: f.subtitle,
            badge: f.badge,
            image: f.image,
          });
        }
      });
    }

    return items;
  }, [projects]);

  function handleProjectClick(projectId: number) {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      navigate(`/projects/${projectId}`);
    }
  }

  return (
    <div className="mx-auto my-6 max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-900/40">
      <ThreeDMarquee
        items={marqueeItems}
        onSelectImage={onSelectDesign}
        onSelectProject={handleProjectClick}
      />
    </div>
  );
}
