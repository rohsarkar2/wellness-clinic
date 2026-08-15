"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import StatusScreen from "@/components/ui/StatusScreen";
import { site, telHref, whatsappHref } from "@/lib/site";

export default function ErrorBoundary({
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
    <StatusScreen
      tone="error"
      icon="fa-solid fa-triangle-exclamation"
      eyebrow="Something went wrong"
      title="This page didn't load"
      description={
        <>
          <p>
            The problem is on our side, not yours. Trying again usually fixes it
            — nothing you were booking has been lost.
          </p>

          {/* The digest is the only handle support has on a production error,
              and the message itself is only useful while developing. */}
          {process.env.NODE_ENV === "development" && error.message ? (
            <pre className="mt-5 overflow-x-auto rounded-xl bg-mist p-4 text-left font-mono text-[0.8rem] whitespace-pre-wrap text-[#a02733]">
              {error.message}
            </pre>
          ) : null}
        </>
      }
      actions={
        <>
          <Button
            type="button"
            onClick={reset}
            variant="default"
            size="pill"
            className="gap-2.5"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            Try Again
          </Button>
          <ButtonLink href="/" variant="secondary" block={false}>
            <i className="fa-solid fa-house" aria-hidden="true" />
            Back to Home
          </ButtonLink>
        </>
      }
      links={[
        {
          href: "/appointment",
          icon: "fa-solid fa-calendar-check",
          label: "Book a visit",
        },
        {
          href: "/doctors",
          icon: "fa-solid fa-user-doctor",
          label: "Our doctors",
        },
        {
          href: "/contact",
          icon: "fa-solid fa-envelope",
          label: "Contact us",
        },
      ]}
      footer={
        <>
          <p className="text-body">
            Need to book right now? Call{" "}
            <a
              href={telHref}
              className="font-semibold text-primary hover:underline"
            >
              {site.phonePrimary}
            </a>{" "}
            or{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              message us on WhatsApp
            </a>
            . {site.hours}.
          </p>

          {error.digest ? (
            <p className="mt-3 font-mono text-[0.78rem] text-[#9aa5b1]">
              Reference: {error.digest}
            </p>
          ) : null}
        </>
      }
    />
  );
}
