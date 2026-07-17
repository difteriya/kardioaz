import { legalMetadata, LegalRoute } from "@/lib/legal-route";
export const generateMetadata = () => legalMetadata("randevu-siyaseti");
export default function Page() {
  return <LegalRoute slug="randevu-siyaseti" />;
}
