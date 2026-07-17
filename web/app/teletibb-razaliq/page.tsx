import { legalMetadata, LegalRoute } from "@/lib/legal-route";
export const generateMetadata = () => legalMetadata("teletibb-razaliq");
export default function Page() {
  return <LegalRoute slug="teletibb-razaliq" />;
}
