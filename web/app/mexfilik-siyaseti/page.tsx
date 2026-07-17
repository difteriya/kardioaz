import { legalMetadata, LegalRoute } from "@/lib/legal-route";
export const generateMetadata = () => legalMetadata("mexfilik-siyaseti");
export default function Page() {
  return <LegalRoute slug="mexfilik-siyaseti" />;
}
