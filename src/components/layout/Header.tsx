"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Github, Twitter } from "lucide-react";
import { InlineNav } from "@/components/ui/InlineNav";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { primaryNav, routes } from "@/lib/constants/routes";

const SOCIALS = [
  { label: "Twitter", href: "https://twitter.com/orvix", Icon: Twitter },
  { label: "GitHub", href: "https://github.com/OrvixCompute/orvix", Icon: Github },
];

function Socials({ className }: { className?: string }) {
  return (
    <div className={className}>
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="text-text-muted transition-colors hover:text-text-primary"
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <Link href={routes.home} className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="Orvix"
        width={24}
        height={24}
        priority
        className="h-6 w-6"
      />
      <span className="font-medium tracking-tight">orvix</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 md:flex">
          <InlineNav items={primaryNav} />
          <Socials className="flex items-center gap-3 border-l border-border pl-5" />
          <ConnectButton />
        </div>

        {/* Mobile toggle */}
        <button
          className="text-text-secondary hover:text-text-primary md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-page flex-col gap-4 px-6 py-6">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
            <ConnectButton className="mt-2 w-fit" />
            <Socials className="mt-2 flex items-center gap-4" />
          </div>
        </div>
      )}
    </header>
  );
}
