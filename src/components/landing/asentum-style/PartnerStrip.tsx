import Image from "next/image";

// Partner strip: a quiet "trusted by" row between the hero and the first
// feature section. Logos render as-is (many partner marks are black-on-black,
// which fits the dark Asentum aesthetic without tinting).
const PARTNERS = [
  { src: "/oobe-protocol.jpg", alt: "OOBE Protocol", href: "https://www.oobeprotocol.ai/" },
  { src: "/supabase-logo.jpg", alt: "Supabase", href: "https://supabase.com/" },
];

export function PartnerStrip() {
  return (
    <section className="border-t border-[#1F1F1F] px-[4%] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
        <span className="font-dm-mono text-xs uppercase tracking-[0.15em] text-[#5A5A5A]">
          Partners
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {PARTNERS.map((partner) => {
            const img = (
              <Image
                src={partner.src}
                alt={partner.alt}
                width={96}
                height={96}
                className="h-12 w-auto opacity-80 transition-opacity hover:opacity-100"
              />
            );
            return partner.href ? (
              <a
                key={partner.src}
                href={partner.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                {img}
              </a>
            ) : (
              <span key={partner.src} className="inline-flex items-center">
                {img}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
