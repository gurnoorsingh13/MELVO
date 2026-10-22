import { Mark } from "@/components/Mark";
import { TransitionLink } from "@/components/TransitionLink";

export default function NotFound() {
  return (
    <section className="nf container">
      <Mark shape="sell" title="An open box" className="nf-mark" />
      <span className="label muted">404</span>
      <h1 className="t-display">
        Nothing here <span className="em" style={{ color: "var(--green)" }}>yet.</span>
      </h1>
      <div>
        <TransitionLink href="/" className="btn">
          Back home <span className="arrow">→</span>
        </TransitionLink>
      </div>
    </section>
  );
}
