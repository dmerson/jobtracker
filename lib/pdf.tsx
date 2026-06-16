import { Document, Page, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 12, fontFamily: "Helvetica-Bold" },
  paragraph: { marginBottom: 6, lineHeight: 1.4 },
});

function ResumeDocument({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

export async function renderResumePdf(title: string, content: string): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument title={title} content={content} />);
}
