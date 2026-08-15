import { ButtonLink } from "@/components/ui/button";
import StatusScreen from "@/components/ui/StatusScreen";
import { site, telHref } from "@/lib/site";

export default function NotFound() {
  return (
    <StatusScreen
      tone="info"
      icon="fa-solid fa-exclamation-triangle"
      eyebrow="Error 404"
      title="We can't find that page"
      description={
        <p>
          The link may be out of date, or the page may have moved. Everything
          below is still where you left it.
        </p>
      }
      actions={
        <>
          <ButtonLink href="/" block={false}>
            <i className="fa-solid fa-house" aria-hidden="true" />
            Back to Home
          </ButtonLink>
          <ButtonLink href="/appointment" variant="secondary" block={false}>
            <i className="fa-solid fa-calendar-check" aria-hidden="true" />
            Book an Appointment
          </ButtonLink>
        </>
      }
      links={[
        {
          href: "/doctors",
          icon: "fa-solid fa-user-doctor",
          label: "Our doctors",
        },
        {
          href: "/services",
          icon: "fa-solid fa-stethoscope",
          label: "Services",
        },
        {
          href: "/contact",
          icon: "fa-solid fa-envelope",
          label: "Contact us",
        },
      ]}
      footer={
        <p className="text-body">
          Prefer to talk to someone? Call{" "}
          <a
            href={telHref}
            className="font-semibold text-primary hover:underline"
          >
            {site.phonePrimary}
          </a>
          . {site.hours}.
        </p>
      }
    />
  );
}
