import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Route } from "./+types/home";
import { createClient } from "@supabase/supabase-js";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const ASSETS = `${import.meta.env.BASE_URL}assets/`;

const EVENT = {
  date: "Viernes 30 de octubre",
  time: "8:00 PM",
  location: "En el valle de los chillos",
};

type Section = {
  id: string;
  title: string;
  subtitle?: string;
  detail?: string;
  cta?: string;
};

const SECTIONS: Section[] = [
  {
    id: "opening",
    title: "Damas y Caballeros",
    detail: "Bienvenidos al espetaculo de fenomenos",
  },
  {
    id: "invitation",
    title: "Donde nada es lo que parece",
    detail: "Y tus pesadillas se hacen realidad",
  },
  { id: "time", title: "El telon se abre", detail: EVENT.date },
  { id: "date", title: "A partir de las", detail: EVENT.time },
  { id: "location", title: "Encuentra la carpa", detail: EVENT.location },

  {
    id: "final",
    title: "El espectaculo esta por comenzar",
  },
  {
    id: "rsvp",
    title: "Te atreves a entrar?",
    cta: "Confirma tu asistencia",
  },
];

const SECTIONS_SCROLL = 60;
const SITE_URL = import.meta.env.VITE_SITE_URL;
const SOCIAL_IMAGE_URL = SITE_URL
  ? new URL("assets/images/og-2.png", SITE_URL).href
  : `${ASSETS}images/og-2.png`;
type Database = {
  public: {
    Tables: {
      guests: {
        Row: { id: number; name: string; icon: number; created_at: string };
        Insert: {
          id?: number;
          name: string;
          icon?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          icon?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_guest_icons: {
        Args: Record<string, never>;
        Returns: { icon: number; name: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseClient: ReturnType<typeof createClient<Database>> | undefined;
type ConfirmedGuest = { icon: number; name: string };

function getSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublicKey) return null;

  return (supabaseClient ??= createClient<Database>(
    supabaseUrl,
    supabasePublicKey,
  ));
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Invitación de Halloween" },
    {
      name: "description",
      content:
        "Estás invitado a una fiesta de Halloween espeluznante y divertida.",
    },
    // Open Graph
    { property: "og:title", content: "Invitación de Halloween" },
    {
      property: "og:description",
      content:
        "Estás invitado a una fiesta de Halloween espeluznante y divertida.",
    },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: SITE_URL || import.meta.env.BASE_URL,
    },
    {
      property: "og:image",
      content: SOCIAL_IMAGE_URL,
    },
    { property: "og:site_name", content: "Invitación de Halloween" },
    { property: "og:image:width", content: "1290" },
    { property: "og:image:height", content: "1620" },
    { property: "og:image:type", content: "image/png" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Invitación de Halloween" },
    {
      name: "twitter:description",
      content:
        "Estás invitado a una fiesta de Halloween espeluznante y divertida.",
    },
    {
      name: "twitter:image",
      content: SOCIAL_IMAGE_URL,
    },
  ];
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const moodRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const clownRef = useRef<HTMLImageElement>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestIcons, setGuestIcons] = useState<ConfirmedGuest[]>([]);
  const [guestIconsStatus, setGuestIconsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isActive = true;
    const refreshGuestIcons = async () => {
      const { data, error } = await supabase.rpc("get_guest_icons");
      if (!isActive) return;

      if (error) {
        console.error("Could not load guest icons", error);
        setGuestIconsStatus((status) =>
          status === "ready" ? status : "error",
        );
        return;
      }

      setGuestIcons(data);
      setGuestIconsStatus("ready");
    };

    void refreshGuestIcons();
    const intervalId = window.setInterval(
      () => void refreshGuestIcons(),
      30_000,
    );

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const playArea = container?.querySelector<HTMLElement>(
      '[data-panel-id="rsvp"]',
    );
    if (!container || !playArea) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const getRandomBetween = (min: number, max: number) =>
      min + Math.random() * Math.max(0, max - min);
    const bubbles: Array<{
      element: HTMLElement;
      radiusX: number;
      radiusY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      setX: (value: number) => void;
      setY: (value: number) => void;
    }> = [];

    const getBounds = () => {
      return { width: playArea.clientWidth, height: playArea.clientHeight };
    };

    let bounds = getBounds();
    const keepInsideBounds = () => {
      bubbles.forEach((bubble) => {
        const minX = bubble.radiusX + 8;
        const maxX = Math.max(minX, bounds.width - bubble.radiusX - 8);
        const minY = bubble.radiusY + 8;
        const maxY = Math.max(minY, bounds.height - bubble.radiusY - 8);

        if (bubble.x < minX) {
          bubble.x = minX;
          bubble.vx = Math.abs(bubble.vx);
        } else if (bubble.x > maxX) {
          bubble.x = maxX;
          bubble.vx = -Math.abs(bubble.vx);
        }

        if (bubble.y < minY) {
          bubble.y = minY;
          bubble.vy = Math.abs(bubble.vy);
        } else if (bubble.y > maxY) {
          bubble.y = maxY;
          bubble.vy = -Math.abs(bubble.vy);
        }

        bubble.setX(bubble.x);
        bubble.setY(bubble.y);
      });
    };

    const addNewBubbles = () => {
      const markers =
        playArea.querySelectorAll<HTMLElement>("[data-guest-float]");
      markers.forEach((element) => {
        if (bubbles.some((bubble) => bubble.element === element)) return;

        gsap.set(element, { left: 0, top: 0, xPercent: -50, yPercent: -50 });
        const radiusX = element.offsetWidth / 2;
        const radiusY = element.offsetHeight / 2;
        const minX = radiusX + 8;
        const maxX = Math.max(minX, bounds.width - radiusX - 8);
        const minY = radiusY + 8;
        const maxY = Math.max(minY, bounds.height - radiusY - 8);
        const angle = Math.random() * Math.PI * 2;
        const speed = getRandomBetween(60, 110);
        const bubble = {
          element,
          radiusX,
          radiusY,
          x: getRandomBetween(minX, maxX),
          y: getRandomBetween(minY, maxY),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          setX: gsap.quickSetter(element, "x", "px") as (value: number) => void,
          setY: gsap.quickSetter(element, "y", "px") as (value: number) => void,
        };

        bubble.setX(bubble.x);
        bubble.setY(bubble.y);
        bubbles.push(bubble);
      });
    };

    let animationFrame = 0;
    let previousTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      bubbles.forEach((bubble) => {
        const minX = bubble.radiusX + 8;
        const maxX = Math.max(minX, bounds.width - bubble.radiusX - 8);
        const minY = bubble.radiusY + 8;
        const maxY = Math.max(minY, bounds.height - bubble.radiusY - 8);

        bubble.x += bubble.vx * delta;
        bubble.y += bubble.vy * delta;

        if (bubble.x < minX) {
          bubble.x = minX;
          bubble.vx = Math.abs(bubble.vx);
        } else if (bubble.x > maxX) {
          bubble.x = maxX;
          bubble.vx = -Math.abs(bubble.vx);
        }

        if (bubble.y < minY) {
          bubble.y = minY;
          bubble.vy = Math.abs(bubble.vy);
        } else if (bubble.y > maxY) {
          bubble.y = maxY;
          bubble.vy = -Math.abs(bubble.vy);
        }

        bubble.setX(bubble.x);
        bubble.setY(bubble.y);
      });

      animationFrame = window.requestAnimationFrame(animate);
    };

    addNewBubbles();
    const mutationObserver = new MutationObserver(addNewBubbles);
    mutationObserver.observe(playArea, { childList: true, subtree: true });

    const resizeObserver = new ResizeObserver(() => {
      bounds = getBounds();
      keepInsideBounds();
    });
    resizeObserver.observe(playArea);

    if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      gsap.set(
        bubbles.map((bubble) => bubble.element),
        { clearProps: "left,top,transform" },
      );
    };
  }, []);

  async function handleRsvpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = guestName.trim();

    if (!name) {
      setRsvpStatus({
        kind: "error",
        message: "Escribe tu nombre para confirmar.",
      });
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setRsvpStatus({
        kind: "error",
        message:
          "La confirmación aún no está configurada. Inténtalo más tarde.",
      });
      return;
    }

    setIsSubmitting(true);
    setRsvpStatus(null);

    try {
      const { error } = await supabase.from("guests").insert({ name });

      if (error) throw error;

      const { data: updatedGuestIcons, error: iconsError } =
        await supabase.rpc("get_guest_icons");
      if (iconsError) {
        console.error("Could not refresh guest icons", iconsError);
        setGuestIconsStatus((status) =>
          status === "ready" ? status : "error",
        );
      } else {
        setGuestIcons(updatedGuestIcons);
        setGuestIconsStatus("ready");
      }

      setGuestName("");
      setRsvpStatus({
        kind: "success",
        message: `¡Gracias, ${name}! Tu asistencia quedó confirmada.`,
      });
      setRsvpOpen(false);
    } catch (error) {
      console.error("Could not save RSVP", error);
      setRsvpStatus({
        kind: "error",
        message: "No pudimos guardar tu confirmación. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useGSAP(
    () => {
      const video = videoRef.current;

      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
      const total = panels.length;

      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const PANELS_START = 1;

      panels.forEach((panel, i) => {
        const titleReveal = gsap.utils.toArray<HTMLElement>(
          "[data-reveal-title]",
          panel,
        );
        const detailReveal = gsap.utils.toArray<HTMLElement>(
          "[data-reveal-detail]",
          panel,
        );
        const subtitleReveal = gsap.utils.toArray<HTMLElement>(
          "[data-reveal-subtitle]",
          panel,
        );

        master.fromTo(
          panel,
          { autoAlpha: 0, y: 48, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.14 },
          PANELS_START + i,
        );

        master.fromTo(
          titleReveal,
          { autoAlpha: 0, y: -100 },
          { autoAlpha: 1, y: 0, duration: 0.24 },
          PANELS_START + i + 0.05,
        );

        master.fromTo(
          detailReveal,
          { autoAlpha: 0, y: 50 },
          { autoAlpha: 1, y: 0, duration: 0.14 },
          PANELS_START + i + 0.1,
        );

        master.fromTo(
          subtitleReveal,
          { autoAlpha: 0, y: 50 },
          { autoAlpha: 1, y: 0, duration: 0.14 },
          PANELS_START + i + 0.1,
        );

        if (i < total - 1) {
          master.to(
            panel,
            { autoAlpha: 0, y: -48, scale: 1.06, duration: 0.16 },
            PANELS_START + i + 0.84,
          );
        }
      });

      // if (moodRef.current) {
      //   master.to(moodRef.current, { opacity: 0.4, duration: 0.6 }, 6);
      //   master.to(moodRef.current, { opacity: 0, duration: 0.7 }, 7.4);
      // }

      if (hintRef.current) {
        master.to(hintRef.current, { autoAlpha: 0, duration: 0.12 }, 0.5);
      }

      if (clownRef.current) {
        const clown = clownRef.current;
        const frames = Array.from({ length: 7 }, (_, i) => {
          const n = String(6 - i).padStart(3, "0");
          return `${ASSETS}sprites/clown/frame_${n}.png`;
        });

        frames.forEach((src) => {
          const img = new Image();
          img.src = src;
        });

        gsap.set(clown, { autoAlpha: 1, scale: 0.9 });
        master.set(clown, { autoAlpha: 1, scale: 0.9 }, 0);

        const FRAME_START = 0.03;
        const FRAME_SPAN = 0.2;
        let lastFrame = -1;
        const swapFrame = (t: number) => {
          const p = Math.min(1, Math.max(0, (t - FRAME_START) / FRAME_SPAN));
          const idx = Math.round(p * (frames.length - 1));
          if (idx !== lastFrame) {
            lastFrame = idx;
            clown.src = frames[idx];
          }
        };
        master.eventCallback("onUpdate", () => {
          swapFrame(master.time());
          if (video?.duration) {
            video.currentTime = gsap.utils.clamp(
              0,
              video.duration,
              master.progress() * video.duration,
            );
          }
        });

        master.to(
          clown,
          { scale: 6, autoAlpha: 0, duration: 1, ease: "none" },
          0.2,
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="relative"
      style={{ height: `${SECTIONS.length * SECTIONS_SCROLL}vh` }}
    >
      <div className="sticky top-0 h-dvh w-dvw overflow-hidden flex items-center justify-center">
        {/* for mobile compatibility transform video with ffmpeg: ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4 */}
        {/* and also add autoPlay */}
        <video
          ref={videoRef}
          className="h-dvh w-full object-cover"
          muted
          playsInline
          preload="metadata"
          // autoPlay
        >
          <source src={`${ASSETS}videos/circus-bg-opt.mp4`} type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/70 via-black/30 to-black/80" />
        <div
          ref={moodRef}
          className="pointer-events-none absolute inset-0 bg-black opacity-0"
        />

        <img
          ref={clownRef}
          className="pointer-events-none absolute -bottom-15 -left-15 h-[70vh] w-auto"
          src={`${ASSETS}sprites/clown/frame_006.png`}
          alt=""
        />

        {SECTIONS.map((section) => (
          <section
            key={section.id}
            data-panel
            data-panel-id={section.id}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
          >
            {section.id === "rsvp" && guestIcons.length > 0 && (
              <ul
                aria-label="Invitados confirmados"
                className="pointer-events-none absolute inset-0 z-10 m-0 list-none p-0"
              >
                {guestIcons.map((guest, index) => {
                  return (
                    <li
                      key={`${guest.icon}-${index}`}
                      data-guest-float
                      className="absolute flex max-w-28 flex-col items-center gap-1"
                    >
                      <img
                        src={`${ASSETS}icons/${guest.icon}.png`}
                        alt=""
                        className="h-14 w-14 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] sm:h-14 sm:w-14"
                      />
                      <span className="max-w-full wrap-break-word rounded-full border border-white/15 bg-black/75 px-2 py-1 text-center text-[12px] leading-tight text-white shadow-lg backdrop-blur-sm sm:text-xs">
                        {guest.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {section.id === "rsvp" ? (
              <div className="relative z-20 flex min-h-72 w-full max-w-5xl items-center justify-center px-6 py-12">
                <h2
                  data-reveal-title
                  className="relative z-20 blood-text font-display text-6xl uppercase tracking-[0.06em] sm:text-6xl"
                >
                  {section.title}
                </h2>
              </div>
            ) : (
              <h2
                data-reveal-title
                className="blood-text font-display text-6xl uppercase tracking-[0.06em] sm:text-6xl"
              >
                {section.title}
              </h2>
            )}

            {section.id === "rsvp" && (
              <p className="relative z-20 -mt-8 mb-2 font-display text-lg uppercase tracking-widest text-[#f3e7d8]/85 [text-shadow:0_0_12px_rgba(0,0,0,0.9)]">
                {guestIconsStatus === "loading"
                  ? "Cargando confirmaciones…"
                  : guestIconsStatus === "error"
                    ? "No se pudieron cargar las confirmaciones"
                    : `${guestIcons.length} ${guestIcons.length === 1 ? "invitado confirmado" : "invitados confirmados"}`}
              </p>
            )}

            {section.detail && (
              <p
                data-reveal-detail
                className="blood-text mt-5 font-display text-4xl uppercase tracking-[0.06em] sm:text-5xl"
              >
                {section.detail}
              </p>
            )}

            {section.subtitle && (
              <p
                data-reveal-subtitle
                className="mt-4 max-w-[34ch] font-display text-4xl uppercase tracking-[0.3em] text-[#e6d9c9]/75 sm:text-base"
              >
                {section.subtitle}
              </p>
            )}

            {section.cta && section.id === "rsvp" && !rsvpOpen && (
              <button
                data-reveal
                type="button"
                className="pointer-events-auto relative z-20 mt-8 rounded-full border border-red-800/70 bg-red-950/40 px-8 py-3 font-display text-base uppercase tracking-widest text-red-200/90 backdrop-blur-sm transition hover:bg-red-800/40 hover:text-[#f3e7d8]"
                onClick={() => {
                  setRsvpOpen(true);
                  setRsvpStatus(null);
                }}
              >
                {section.cta}
              </button>
            )}

            {section.id === "rsvp" && rsvpOpen && (
              <form
                className="pointer-events-auto relative z-20 mt-8 flex w-[min(90vw,24rem)] flex-col gap-3 rounded-xl border border-red-900/60 bg-black/75 p-5 text-left shadow-2xl backdrop-blur-md"
                onSubmit={handleRsvpSubmit}
              >
                <label
                  htmlFor="guest-name"
                  className="font-display text-lg uppercase tracking-widest text-[#f3e7d8]"
                >
                  Tu nombre
                </label>
                <input
                  id="guest-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={guestName}
                  onChange={(event) => setGuestName(event.currentTarget.value)}
                  placeholder="Escribe tu nombre"
                  className="w-full rounded-md border border-red-900/70 bg-black/70 px-4 py-3 text-white placeholder:text-white/45 focus:border-red-500 focus:outline-none"
                />

                {rsvpStatus && (
                  <p
                    role={rsvpStatus.kind === "error" ? "alert" : "status"}
                    className={
                      rsvpStatus.kind === "error"
                        ? "text-sm text-red-300"
                        : "text-sm text-emerald-200"
                    }
                  >
                    {rsvpStatus.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full border border-red-800/70 bg-red-950/70 px-6 py-2 font-display text-sm uppercase tracking-widest text-red-100 transition hover:bg-red-800/70 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSubmitting ? "Guardando…" : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpOpen(false);
                      setRsvpStatus(null);
                    }}
                    className="rounded-full px-5 py-2 font-display text-sm uppercase tracking-widest text-white/70 transition hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </section>
        ))}

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white/80 [text-shadow:0_0_12px_rgba(0,0,0,0.9)]">
            Desliza para entrar
          </span>
          <svg
            className="h-8 w-8 animate-bounce text-red-200/90 drop-shadow-[0_0_8px_rgba(150,0,0,0.6)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5l0 14" />
            <path d="M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </main>
  );
}
