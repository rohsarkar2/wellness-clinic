import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function NotFound() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-160 rounded-[16px] bg-white p-9 text-center shadow-card sm:rounded-[22px] sm:p-[55px_40px]">
          <div className="mx-auto mb-6.5 flex size-19.5 items-center justify-center rounded-full bg-mist text-[2.2rem] text-primary sm:size-24 sm:text-[2.8rem]">
            <i className="fa-solid fa-compass" aria-hidden="true" />
          </div>
          <h1 className="mb-3 font-display text-[1.6rem] font-bold text-ink sm:text-[2rem]">
            Page Not Found
          </h1>
          <p>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="mt-7.5 flex flex-wrap justify-center gap-3.5">
            <ButtonLink href="/" block={false}>
              Back to Home
            </ButtonLink>
            <ButtonLink href="/doctors" variant="secondary" block={false}>
              Browse Doctors
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
