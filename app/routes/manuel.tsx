import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./manuel.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ASSETS = `${import.meta.env.BASE_URL}assets/images/bbq/`;
const SITE_URL = import.meta.env.VITE_SITE_URL;
const SOCIAL_IMAGE_URL = SITE_URL
  ? new URL(
      "assets/images/bbq/parrillada.png",
      SITE_URL.endsWith("/") ? SITE_URL : `${SITE_URL}/`,
    ).href
  : `${ASSETS}parrillada.png`;
const MAP_URL = "https://maps.app.goo.gl/Lrssoss8Zb2Swa878";

const DETAILS = [
  {
    id: "reason",
    eyebrow: "El motivo",
    title: "Un ascenso merece una buena parrillada.",
    copy: "Celebramos el nuevo reto de Manuel y brindamos por todo lo que viene.",
  },
  {
    id: "date",
    eyebrow: "Aparta la fecha",
    title: "19 de noviembre",
    copy: "Nos juntamos para despedirlo como se debe.",
  },
  {
    id: "place",
    eyebrow: "Nos vemos en",
    title: "Quinta Los Mirlos",
    copy: "Valle de los Chillos",
  },
] as const;

export function meta() {
  return [
    { title: "Parrillada de despedida para Manuel Prieto" },
    {
      name: "description",
      content:
        "Celebremos el ascenso de Manuel Prieto con una parrillada en Quinta Los Mirlos, Valle de los Chillos, el 19 de noviembre.",
    },
    { property: "og:title", content: "Una parrillada para Manuel Prieto" },
    {
      property: "og:description",
      content:
        "Una nueva etapa merece una buena parrillada. 19 de noviembre en Quinta Los Mirlos.",
    },
    { property: "og:type", content: "website" },
    { property: "og:image", content: SOCIAL_IMAGE_URL },
    { property: "og:image:secure_url", content: SOCIAL_IMAGE_URL },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1797" },
    { property: "og:image:height", content: "980" },
    {
      property: "og:image:alt",
      content: "Ilustración de compañeros compartiendo una parrillada.",
    },
    { property: "og:site_name", content: "Invitación a la parrillada" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Una parrillada para Manuel Prieto" },
    {
      name: "twitter:description",
      content:
        "Una nueva etapa merece una buena parrillada. 19 de noviembre en Quinta Los Mirlos.",
    },
    { name: "twitter:image", content: SOCIAL_IMAGE_URL },
    {
      name: "twitter:image:alt",
      content: "Ilustración de compañeros compartiendo una parrillada.",
    },
  ];
}

export default function ManuelInvitation() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const stage = stageRef.current;
      if (!container || !stage) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      const steak = stage.querySelector<HTMLElement>("[data-steak]");
      const grill = stage.querySelector<HTMLElement>("[data-grill]");
      const fireBack = stage.querySelector<HTMLElement>("[data-fire-back]");
      const fireFront = stage.querySelector<HTMLElement>("[data-fire-front]");
      const trail = stage.querySelector<HTMLElement>("[data-fall-trail]");
      const intro = stage.querySelector<HTMLElement>("[data-intro]");
      const introArt = stage.querySelector<HTMLElement>("[data-intro-art]");
      const progress = stage.querySelector<HTMLElement>(".bbq-progress span");
      const details = gsap.utils.toArray<HTMLElement>("[data-detail]", stage);
      const finale = stage.querySelector<HTMLElement>("[data-finale]");
      if (
        !steak ||
        !grill ||
        !fireBack ||
        !fireFront ||
        !trail ||
        !intro ||
        !introArt ||
        !finale
      )
        return;

      const getSteakContactY = () =>
        grill.offsetTop + grill.offsetHeight * 0.24;
      const getFireContactY = () => grill.offsetTop + grill.offsetHeight * 0.34;

      const getGrateLandingY = () => {
        const grateSurfaceY = getSteakContactY();
        const steakMassCenterY = steak.offsetTop + steak.offsetHeight * 0.6;
        return grateSurfaceY - steakMassCenterY;
      };

      const getFireLandingY = (fire: HTMLElement) =>
        getFireContactY() - (fire.offsetTop + fire.offsetHeight * 0.84);

      gsap.set(intro, { autoAlpha: 1, y: 0 });
      gsap.set(introArt, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(details, { autoAlpha: 0, y: 28 });
      gsap.set(finale, { autoAlpha: 0, y: 32 });
      gsap.set(steak, {
        autoAlpha: 0,
        xPercent: -50,
        y: () => -window.innerHeight * 0.92,
        x: -18,
        rotation: -28,
        rotationX: -26,
        rotationY: 16,
        transformPerspective: 900,
        transformOrigin: "50% 60%",
        scale: 0.62,
      });
      gsap.set(grill, { autoAlpha: 0.25, y: 34 });
      gsap.set([fireBack, fireFront], {
        autoAlpha: 0,
        scale: 0.55,
        transformOrigin: "50% 80%",
      });
      gsap.set(fireBack, { y: () => getFireLandingY(fireBack) });
      gsap.set(fireFront, { y: () => getFireLandingY(fireFront) });
      gsap.set(trail, {
        autoAlpha: 0,
        scaleY: 0.35,
        transformOrigin: "50% 100%",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          invalidateOnRefresh: true,
          onRefresh: () => {
            gsap.set(fireBack, { y: getFireLandingY(fireBack) });
            gsap.set(fireFront, { y: getFireLandingY(fireFront) });
          },
        },
      });

      timeline.to(intro, { autoAlpha: 0, y: -24, duration: 0.55 }, 0.3);
      timeline.to(introArt, { autoAlpha: 0, y: -14, scale: 0.96, duration: 0.55 }, 0.3);
      timeline.to(steak, { autoAlpha: 1, duration: 0.14 }, 0.12);
      timeline.to(grill, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.8);
      timeline.to(
        steak,
        {
          y: () => -window.innerHeight * 0.4,
          scale: 0.72,
          duration: 0.72,
          ease: "power2.in",
        },
        0.14,
      );
      timeline.to(
        steak,
        {
          y: getGrateLandingY,
          rotation: 362,
          scale: 1,
          duration: 3.29,
          ease: "power2.in",
        },
        0.86,
      );

      timeline.to(trail, { autoAlpha: 0.85, scaleY: 1, duration: 0.25 }, 0.24);
      timeline.to(trail, { autoAlpha: 0.35, duration: 2.25 }, 0.49);
      timeline.to(trail, { autoAlpha: 0, duration: 0.3 }, 3.15);
      timeline.to(
        steak,
        {
          x: 24,
          rotationX: 22,
          rotationY: -12,
          duration: 0.78,
          ease: "sine.inOut",
        },
        0.58,
      );
      timeline.to(
        steak,
        {
          x: -20,
          rotationX: -18,
          rotationY: 10,
          duration: 0.74,
          ease: "sine.inOut",
        },
        1.36,
      );
      timeline.to(
        steak,
        {
          x: 13,
          rotationX: 15,
          rotationY: -8,
          duration: 0.72,
          ease: "sine.inOut",
        },
        2.1,
      );
      timeline.to(
        steak,
        {
          x: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.72,
          ease: "power2.out",
        },
        2.82,
      );

      details.forEach((detail, index) => {
        const start = 1.05 + index * 1.04;
        timeline.to(detail, { autoAlpha: 1, y: 0, duration: 0.24 }, start);
        timeline.to(
          detail,
          { autoAlpha: 0, y: -18, duration: 0.22 },
          start + 0.82,
        );
      });

      timeline.to(
        steak,
        {
          y: () => getGrateLandingY() + 12,
          rotation: 367,
          rotationX: -7,
          duration: 0.15,
          ease: "power2.in",
        },
        4.15,
      );
      timeline.to(
        steak,
        {
          y: () => getGrateLandingY() - 15,
          rotation: 350,
          rotationX: 5,
          scaleX: 1.08,
          scaleY: 0.88,
          duration: 0.15,
          ease: "power2.out",
        },
        4.3,
      );
      timeline.to(
        steak,
        {
          y: () => getGrateLandingY() + 3,
          rotation: 365,
          rotationX: 0,
          scaleX: 0.98,
          scaleY: 1.03,
          duration: 0.18,
          ease: "power2.inOut",
        },
        4.45,
      );
      timeline.to(
        steak,
        {
          y: getGrateLandingY,
          scaleX: 1,
          scaleY: 1,
          rotation: 362,
          duration: 0.28,
          ease: "elastic.out(1, 0.65)",
        },
        4.65,
      );
      timeline.to(
        fireBack,
        { autoAlpha: 1, scale: 1.06, duration: 0.2, ease: "back.out(1.7)" },
        4.28,
      );
      timeline.to(
        fireFront,
        { autoAlpha: 1, scale: 1.08, duration: 0.2, ease: "back.out(1.7)" },
        4.34,
      );
      timeline.to(
        fireBack,
        { scale: 1, duration: 0.28, ease: "power1.out" },
        4.48,
      );
      timeline.to(
        fireFront,
        { scale: 1, duration: 0.28, ease: "power1.out" },
        4.54,
      );
      timeline.to(finale, { autoAlpha: 1, y: 0, duration: 0.48 }, 4.0);
      if (progress) {
        timeline.to(progress, { scaleX: 1, duration: 5.3 }, 0);
      }
      timeline.to(stage, { x: -5, duration: 0.035 }, 4.3);
      timeline.to(stage, { x: 5, duration: 0.035 }, 4.335);
      timeline.to(stage, { x: -3, duration: 0.035 }, 4.37);
      timeline.to(stage, { x: 0, duration: 0.04 }, 4.405);
    },
    { scope: containerRef },
  );

  return (
    <main ref={containerRef} className="manuel-invite">
      <div ref={stageRef} className="bbq-stage">
        <div className="bbq-backdrop" aria-hidden="true" />
        <div className="bbq-glow bbq-glow--left" aria-hidden="true" />
        <div className="bbq-glow bbq-glow--right" aria-hidden="true" />
        <div className="bbq-embers" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} />
          ))}
        </div>

        <header className="bbq-intro" data-intro>
          <p className="bbq-kicker">Una nueva etapa se celebra</p>
          <h1>
            Manuel
            <span>Prieto</span>
          </h1>
          <p className="bbq-intro-copy">
            Nuevo equipo, nuevo reto… y una última parrillada con los de
            siempre.
          </p>
          <div className="bbq-scroll-cue" aria-hidden="true">
            <span>Desliza para ver la invitación</span>
            <span className="bbq-scroll-arrow">↓</span>
          </div>
        </header>

        <div
          className="bbq-preparate-art"
          data-intro-art
          role="img"
          aria-label="Dos compañeros en una escena graciosa, con el mensaje: Tu momento ha llegado"
        >
          <img
            src={`${ASSETS}preparate.webp`}
            alt=""
            draggable="false"
            width={512}
            height={512}
          />
          <span className="bbq-preparate-label" aria-hidden="true">
            Tu momento ha llegado
          </span>
        </div>

        <div className="bbq-story" aria-label="Detalles de la invitación">
          {DETAILS.map((detail, index) => (
            <article
              key={detail.id}
              className={`bbq-detail bbq-detail--${index % 2 === 0 ? "left" : "right"}`}
              data-detail
            >
              <p className="bbq-detail-eyebrow">{detail.eyebrow}</p>
              <h2>{detail.title}</h2>
              <p className="bbq-detail-copy">{detail.copy}</p>
            </article>
          ))}
        </div>

        <img
          className="bbq-grill"
          data-grill
          src={`${ASSETS}grill.png`}
          alt=""
          aria-hidden="true"
          draggable="false"
          width={1080}
          height={724}
        />
        <div className="bbq-steak-flight" data-steak>
          <div className="bbq-fall-trail" data-fall-trail aria-hidden="true" />
          <img
            className="bbq-steak"
            src={`${ASSETS}tomahawk.png`}
            alt=""
            aria-hidden="true"
            draggable="false"
            width={1024}
            height={1024}
          />
        </div>
        <div
          className="bbq-fire-group bbq-fire-group--behind"
          data-fire-back
          aria-hidden="true"
        >
          <img
            className="bbq-fire-puff bbq-fire-puff--left"
            src={`${ASSETS}fire.png`}
            alt=""
            draggable="false"
            width={1024}
            height={1024}
          />
        </div>
        <div
          className="bbq-fire-group bbq-fire-group--front"
          data-fire-front
          aria-hidden="true"
        >
          <img
            className="bbq-fire-puff bbq-fire-puff--center"
            src={`${ASSETS}fire.png`}
            alt=""
            draggable="false"
            width={1024}
            height={1024}
          />
          <img
            className="bbq-fire-puff bbq-fire-puff--right"
            src={`${ASSETS}fire.png`}
            alt=""
            draggable="false"
            width={1024}
            height={1024}
          />
        </div>

        <section
          className="bbq-finale"
          data-finale
          aria-labelledby="final-title"
        >
          <p className="bbq-kicker">Una despedida a la parrilla</p>
          <h2 id="final-title">¡Muchos Éxitos Manu!</h2>
          <p className="bbq-final-details">
            <strong>19 de noviembre</strong>
            <span>Quinta Los Mirlos · Valle de los Chillos</span>
          </p>
          <a
            className="bbq-map-link"
            href={MAP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Abrir ubicación
            <span aria-hidden="true">↗</span>
          </a>
          <div
            className="bbq-confirmation-art"
            role="img"
            aria-label="Una persona sostiene una hoja que dice: Confirma la confirmación"
          >
            <img
              src={`${ASSETS}confirma.webp`}
              alt=""
              draggable="false"
              width={780}
              height={780}
            />
            <span className="bbq-confirmation-paper" aria-hidden="true">
              <span>Confirma</span>
              <span>la</span>
              <span>confirmación</span>
            </span>
          </div>
        </section>

        <div className="bbq-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
