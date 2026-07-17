import { legalMetadata, LegalRoute } from "@/lib/legal-route";
export const generateMetadata = () => legalMetadata("kuki-siyaseti");
export default function Page() {
  return <LegalRoute slug="kuki-siyaseti" />;
}
