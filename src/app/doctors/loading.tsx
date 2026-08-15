import Container from "@/components/ui/Container";
import { DoctorGridSkeleton } from "@/components/ui/Loading";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

export default function DoctorsLoading() {
  return (
    <Section>
      <Container>
        <SectionTitle eyebrow="Providers" title="Our Specialists" />
        <DoctorGridSkeleton />
      </Container>
    </Section>
  );
}
