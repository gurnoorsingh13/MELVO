import { Mark3D } from "@/components/Mark3D";
import { TransitionLink } from "@/components/TransitionLink";

export default function NotFound() {
  return (
    <section className="hero nf" data-theme-section="dark">
      <div className="hero-object">
        <Mark3D shape="sell" tone="paper" />
      </div>
      <div className="hero-copy page">
        <h1 className="t-giant">
          Oops<span className="dot" />
        </h1>
        <p className="t-h4 hero-sub">Nothing here yet.</p>
        <TransitionLink href="/" className="pill pill--solid">
          <span className="pill-text">Back home</span>
        </TransitionLink>
      </div>
    </section>
  );
}
