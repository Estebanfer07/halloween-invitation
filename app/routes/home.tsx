import { useRef } from "react";
import type { Route } from "./+types/home";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EVENT = {
  date: "Sabado 31 de octubre",
  time: "9:00 PM & Hasta la hora de las brujas",
  location: "El Circo de Medianoche & Calle Ravenwood 13",
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
    title: "BIENVENIDO AL ESPECTACULO",
    subtitle: "Algo siniestro te espera dentro...",
  },
  {
    id: "invitation",
    title: "ESTAS INVITADO",
    subtitle: "A una noche donde lo inesperado es parte del espectaculo.",
  },
  { id: "date", title: "LA NOCHE", detail: EVENT.date },
  { id: "time", title: "EL ESPECTACULO COMIENZA", detail: EVENT.time },
  { id: "location", title: "EL CIRCO ESPERA", detail: EVENT.location },
  {
    id: "dress",
    title: "VISTE PARA IMPRESIONAR",
    subtitle: "Ven vestido para la ocasion.",
  },
  {
    id: "warning",
    title: "PERO RECUERDA",
    subtitle: "NO TODO AQUI ES PARTE DEL ESPECTACULO.",
  },
  {
    id: "final",
    title: "EL ESPECTACULO ESTA POR COMENZAR",
    subtitle: "TE UNES A NOSOTROS?",
  },
  {
    id: "rsvp",
    title: "CONFIRMA TU ASISTENCIA",
    subtitle: "Cuentanos si podras venir.",
    cta: "AHI ESTARE",
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Invitación de Halloween" },
    {
      name: "description",
      content: "Estás invitado a una fiesta de Halloween espeluznante!",
    },
  ];
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const moodRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      let cleanup: (() => void) | undefined;
      const video = videoRef.current;
      if (video) {
        gsap.to(video, {
          currentTime: () => video.duration || 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        const refresh = () => ScrollTrigger.refresh();
        if (video.readyState >= 1) {
          refresh();
        } else {
          video.addEventListener("loadedmetadata", refresh);
          cleanup = () => video.removeEventListener("loadedmetadata", refresh);
        }
      }

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

      panels.forEach((panel, i) => {
        const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]", panel);

        master.fromTo(
          panel,
          { autoAlpha: 0, y: 48, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.14 },
          i,
        );

        reveals.forEach((el, j) => {
          master.fromTo(
            el,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.14 },
            i + 0.05 + j * 0.22,
          );
        });

        if (i < total - 1) {
          master.to(
            panel,
            { autoAlpha: 0, y: -48, scale: 1.06, duration: 0.16 },
            i + 0.84,
          );
        }
      });

      // if (moodRef.current) {
      //   master.to(moodRef.current, { opacity: 0.4, duration: 0.6 }, 6);
      //   master.to(moodRef.current, { opacity: 0, duration: 0.7 }, 7.4);
      // }

      if (hintRef.current) {
        master.fromTo(
          hintRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.08 },
          0.02,
        );
        master.to(hintRef.current, { autoAlpha: 0, duration: 0.12 }, 0.5);
      }

      return () => cleanup?.();
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="relative"
      style={{ height: `${SECTIONS.length * 100}vh` }}
    >
      <div className="sticky top-0 h-dvh w-dvw overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          className="h-dvh w-full object-cover"
          muted
          playsInline
          preload="auto"
        >
          <source src="/assets/videos/circus-background.mp4" type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
        <div
          ref={moodRef}
          className="pointer-events-none absolute inset-0 bg-black opacity-0"
        />

        {SECTIONS.map((section) => (
          <section
            key={section.id}
            data-panel
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
          >
            <h2
              data-reveal
              className="blood-text font-display text-6xl uppercase tracking-[0.06em] sm:text-6xl"
            >
              {section.title}
            </h2>

            {section.detail && (
              <p
                data-reveal
                className="blood-text mt-5 font-display text-4xl uppercase tracking-[0.06em] sm:text-5xl"
              >
                {section.detail}
              </p>
            )}

            {section.subtitle && (
              <p
                data-reveal
                className="mt-4 max-w-[34ch] text-sm uppercase tracking-[0.3em] text-[#e6d9c9]/75 sm:text-base"
              >
                {section.subtitle}
              </p>
            )}

            {section.cta && (
              <button
                data-reveal
                type="button"
                className="pointer-events-auto mt-8 rounded-full border border-red-800/70 bg-red-950/40 px-8 py-3 font-display text-base uppercase tracking-[0.1em] text-red-200/90 backdrop-blur-sm transition hover:bg-red-800/40 hover:text-[#f3e7d8]"
              >
                {section.cta}
              </button>
            )}
          </section>
        ))}

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.5em] text-white/60 opacity-0"
        >
          Desliza para entrar
        </div>
      </div>
    </main>
  );
}
