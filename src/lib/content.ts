import type { ShapeName } from "./shapes";

export const SITE = {
  name: "MELVO",
  url: "https://melvo.in",
  funUrl: "https://melvo.fun",
  email: "hello@melvo.in",
  hero: { line1: "Thought of it?", line2a: "Let's", line2em: "build", line2b: "it" },
  heroSub:
    "We teach the skills, shape the brand, open the store and write the software. One team, from first idea to full scale.",
  description:
    "MELVO builds skills, businesses, brands and technology. EdTech and mentorship, brand building, e-commerce and software under one roof.",
};

export type CapabilitySlug = "learn" | "brand" | "sell" | "scale";

export type Capability = {
  slug: CapabilitySlug;
  index: string;
  verb: string;
  name: string;
  shape: ShapeName;
  headline: string;
  headlineEm: string;
  summary: string;
  intro: string;
  services: { title: string; text: string }[];
  audience: string[];
  outcomes: string[];
  vignette: "course" | "identity" | "listing" | "dashboard";
};

export const CAPABILITIES: Capability[] = [
  {
    slug: "learn",
    index: "01",
    verb: "Learn",
    name: "EdTech & Mentorship",
    shape: "learn",
    headline: "Learning that ends in something you",
    headlineEm: "built.",
    summary: "Practical courses, workshops and mentorship for students, schools, colleges and professionals.",
    intro:
      "Every program is hands-on. Learners write the code, wire the circuit, train the model and present the work. They leave with skills they can use and a project they can show.",
    services: [
      { title: "Professional courses", text: "Industry-ready skills for working professionals and career switchers." },
      { title: "Technical courses", text: "Coding, AI, robotics and electronics, taught by building real things." },
      { title: "Mentorship programs", text: "One-to-one and small-group guidance from people who do the work." },
      { title: "Workshops and webinars", text: "Focused sessions, from a single afternoon to a full weekend." },
      { title: "School programs", text: "Robotics, AI and technology labs designed around the school year." },
      { title: "College and institutional training", text: "Skill-development and industry-oriented programs for campuses and teams." },
      { title: "Robotics and AI labs", text: "Kits, curriculum and trainers for experiential learning spaces." },
    ],
    audience: ["Students", "Schools", "Colleges", "Professionals", "Companies"],
    outcomes: ["A finished project in every program", "Mentors from industry", "Certificates backed by real work"],
    vignette: "course",
  },
  {
    slug: "brand",
    index: "02",
    verb: "Brand",
    name: "Brand Building & Management",
    shape: "brand",
    headline: "Brands that know exactly who they",
    headlineEm: "are.",
    summary: "Strategy, naming and identity systems, then the everyday work of keeping a brand consistent.",
    intro:
      "A brand is more than a logo. We find what makes you different, give it a name and a look, write the rules, and then help you show up the same way everywhere, every week.",
    services: [
      { title: "Brand strategy and positioning", text: "Who you are for, why you matter and how you say it." },
      { title: "Naming", text: "Names that are memorable, available and right for where you are going." },
      { title: "Visual identity and logo systems", text: "Logos, colour, type and the system that holds them together." },
      { title: "Brand guidelines", text: "Clear rules your team and partners can actually follow." },
      { title: "Social media identity", text: "Templates, tone and a feed that looks like you." },
      { title: "Campaigns and creatives", text: "Launches and campaigns built on the brand, not around it." },
      { title: "Brand management", text: "Ongoing creative direction so the brand stays sharp as it grows." },
    ],
    audience: ["Founders", "Startups", "Small businesses", "Established companies", "Institutions"],
    outcomes: ["A clear position", "A complete identity system", "Guidelines your team can use"],
    vignette: "identity",
  },
  {
    slug: "sell",
    index: "03",
    verb: "Sell",
    name: "E-Commerce & Digital Commerce",
    shape: "sell",
    headline: "From your table to their",
    headlineEm: "cart.",
    summary: "Photography, listings, storefronts and marketplaces that take products online and make them sell.",
    intro:
      "We take a product from the physical world to a digital shelf. We shoot it, model it, write it, list it and launch it, on Amazon, on your own store, or both.",
    services: [
      { title: "E-commerce websites", text: "Fast, branded storefronts built to convert." },
      { title: "Amazon and marketplace setup", text: "Accounts, catalogues and brand stores, set up properly." },
      { title: "Marketplace management", text: "Listings, pricing, stock and performance, managed for you." },
      { title: "Product photography and 3D", text: "Studio shots, lifestyle images and product models." },
      { title: "Listings and descriptions", text: "Titles and copy written for search and for people." },
      { title: "Catalogues and A+ content", text: "Rich content that explains the product and builds trust." },
      { title: "Banners and product creatives", text: "Marketplace banners, ads and launch creatives." },
    ],
    audience: ["Makers", "D2C brands", "Manufacturers", "Retailers", "Exporters"],
    outcomes: ["Listings ready to launch", "Images that sell", "A storefront that converts"],
    vignette: "listing",
  },
  {
    slug: "scale",
    index: "04",
    verb: "Scale",
    name: "Software & Technology",
    shape: "scale",
    headline: "Software that keeps up with",
    headlineEm: "you.",
    summary: "Websites, apps, dashboards and automation, engineered to be reliable today and ready for tomorrow.",
    intro:
      "We design and build digital products that solve a real problem: the app your customers use, the dashboard your team runs on, the automation that gives you your evenings back.",
    services: [
      { title: "Websites and web apps", text: "From marketing sites to complex web platforms." },
      { title: "Mobile apps", text: "iOS and Android apps people keep on their home screen." },
      { title: "SaaS products", text: "From first version to a product that scales." },
      { title: "Dashboards and internal tools", text: "Live data and tools your team actually likes using." },
      { title: "Automation and integrations", text: "APIs and workflows that connect your systems." },
      { title: "AI and ML solutions", text: "Practical AI that saves time or makes better decisions." },
      { title: "Technology consulting", text: "Honest advice on what to build, buy or skip." },
    ],
    audience: ["Startups", "Growing businesses", "Enterprises", "Institutions", "Product teams"],
    outcomes: ["Software that is easy to change", "Clean, documented code", "Systems that scale with you"],
    vignette: "dashboard",
  },
];

export const capability = (slug: string) => CAPABILITIES.find((c) => c.slug === slug);

export const INTRO_STATEMENT =
  "Most ideas get stuck between people. The course is in one place, the brand in another, the store and the software somewhere else. MELVO is one team for all four, so nothing gets lost on the way from idea to impact.";

export const WAYS_TO_START = [
  { verb: "Learn", title: "Workshop", time: "1 to 3 days", text: "Hands-on sessions for schools, colleges and teams. Everyone builds something." },
  { verb: "Learn", title: "Course and mentorship", time: "4 to 12 weeks", text: "Structured learning with a mentor, ending in a project you can show." },
  { verb: "Brand", title: "Brand sprint", time: "2 to 4 weeks", text: "Positioning, name and identity for a new idea or a fresh start." },
  { verb: "Sell", title: "Marketplace launch", time: "4 to 8 weeks", text: "Shoot, list and launch your products on Amazon or your own store." },
  { verb: "Scale", title: "Product build", time: "6 to 16 weeks", text: "Design and build a web or mobile product, from first screen to launch." },
  { verb: "All four", title: "Growth partner", time: "Monthly", text: "Brand, commerce and technology, managed together by one team." },
];

export const PROCESS = [
  { title: "Listen", text: "We start with your goal, not with our services. One conversation to understand what you are trying to make happen." },
  { title: "Plan", text: "One plan across learning, brand, commerce and technology, with a clear scope, timeline and fixed quote." },
  { title: "Build", text: "Small steps, shown early and often. You see real work every week, not a big reveal at the end." },
  { title: "Grow", text: "We stay on after launch to measure, improve and scale what works." },
];

export const PRINCIPLES = [
  { title: "Make it real", text: "Ideas are only worth something once they exist. We bias towards building." },
  { title: "Teach as we build", text: "We explain our work, so clients and learners grow more capable with every project." },
  { title: "One team, no hand-offs", text: "Learning, brand, commerce and tech sit at the same table." },
  { title: "Plain words", text: "No jargon, no inflated decks. Clear scope, clear prices, clear progress." },
  { title: "Built to last", text: "Brands, systems and skills that still work long after we step back." },
];

export const FAQ = [
  { q: "Do I need all four services?", a: "No. Most people start with one. The others are there when you need them, and they connect without starting over." },
  { q: "Who do you work with?", a: "Students, schools, colleges, professionals, creators, founders, small businesses, established companies and institutions." },
  { q: "How does pricing work?", a: "After a first conversation we send a clear scope with a fixed quote. Workshops and courses have published fees." },
  { q: "What is melvo.fun?", a: "Our learning platform. Courses, workshops and mentorship where you learn by building real projects." },
  { q: "Can you work with our existing team?", a: "Yes. We can lead a project end to end or plug into your team for one part of it." },
];

export const NAV = [
  { href: "/learn", label: "Learn", shape: "learn" as ShapeName },
  { href: "/brand", label: "Brand", shape: "brand" as ShapeName },
  { href: "/sell", label: "Sell", shape: "sell" as ShapeName },
  { href: "/scale", label: "Scale", shape: "scale" as ShapeName },
  { href: "/about", label: "About", shape: "m" as ShapeName },
];

export const STATEMENT = {
  lead: "We build things that matter to",
  words: ["students.", "founders.", "brands.", "schools.", "makers.", "businesses."],
  body:
    "Anyone can have an idea. Turning it into a skill, a brand, a store or a product that works is the hard part. It takes learning, design, commerce and technology at one table.",
};

export const AUDIENCE = [
  "Students",
  "Schools",
  "Colleges",
  "Professionals",
  "Founders",
  "Startups",
  "D2C brands",
  "Makers",
  "Manufacturers",
  "Retailers",
  "Exporters",
  "Institutions",
  "Enterprises",
  "Product teams",
  "Creators",
  "Small businesses",
];

export const SELL_FLOW = [
  { t: "Product", d: "What you make, as it is today." },
  { t: "Photography", d: "Studio shots, 3D models, lifestyle." },
  { t: "Branding", d: "Packaging, voice, visual system." },
  { t: "Listing", d: "Titles, copy, A+ content, banners." },
  { t: "Marketplace", d: "Amazon, your own store, or both." },
  { t: "Customer", d: "Someone, somewhere, clicks buy." },
];
