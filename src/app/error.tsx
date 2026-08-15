"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { site } from "@/lib/site";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-160 rounded-[16px] bg-white p-9 text-center shadow-card sm:rounded-[22px] sm:p-[55px_40px]">
          <div className="mx-auto mb-6.5 flex size-19.5 items-center justify-center rounded-full bg-[#fdeced] text-[2.2rem] text-[#a02733] sm:size-24 sm:text-[2.8rem]">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          </div>
          <h1 className="mb-3 font-display text-[1.6rem] font-bold text-ink sm:text-[2rem]">
            Something Went Wrong
          </h1>
          <p>
            We couldn&apos;t load this page. Please try again — if it keeps happening, call us on{" "}
            {site.phonePrimary}.
          </p>
          <div className="mt-7.5 flex flex-wrap justify-center gap-3.5">
            <Button type="button" onClick={reset}>
              Try Again
            </Button>
            <ButtonLink href="/" variant="secondary" block={false}>
              Back to Home
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
