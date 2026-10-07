import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Halloween Invitation" },
    {
      name: "description",
      content: "Estás invitado a una fiesta de Halloween espeluznante!",
    },
  ];
}

export default function Home() {
  return (
    <main className="relative h-dvh w-dvw overflow-hidden flex items-center justify-center">
      <video className="h-dvh object-coverr" autoPlay loop muted>
        <source src="/assets/videos/circus-background.mp4" type="video/mp4" />
      </video>
    </main>
  );
}
