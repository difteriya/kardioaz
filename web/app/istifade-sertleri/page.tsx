import { legalMetadata, LegalRoute } from "@/lib/legal-route";
export const generateMetadata = () => legalMetadata("istifade-sertleri");
export default function Page() {
  return <LegalRoute slug="istifade-sertleri" />;
}
