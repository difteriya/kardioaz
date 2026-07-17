import { legalMetadata, LegalRoute } from "@/lib/legal-route";
export const generateMetadata = () => legalMetadata("tibbi-bildiris");
export default function Page() {
  return <LegalRoute slug="tibbi-bildiris" />;
}
