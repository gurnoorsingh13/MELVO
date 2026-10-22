import { Capabilities, CtaBand, Faq, Hero, Intro, Paths, Process, Ways } from "@/components/home";
import { Marquee } from "@/components/motion";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Capabilities />
      <Ways />
      <Marquee
        items={[
          <>Seekho.</>,
          <>Banao.</>,
          <>Becho.</>,
          <>
            <span className="em">Badhao.</span>
          </>,
        ]}
      />
      <Process />
      <Paths />
      <Faq />
      <CtaBand />
    </>
  );
}
