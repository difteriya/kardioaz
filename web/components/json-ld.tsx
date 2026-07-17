/**
 * Renders a JSON-LD <script>. Pass a schema object from lib/schema.ts.
 * Safe: schema objects are our own data, not user input.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
