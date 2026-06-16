import { Document, Page, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 12, fontFamily: "Helvetica-Bold" },
  h2: { fontSize: 13, marginTop: 10, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  h3: { fontSize: 11, marginTop: 8, marginBottom: 3, fontFamily: "Helvetica-Bold" },
  paragraph: { marginBottom: 5, lineHeight: 1.4 },
  bullet: { marginBottom: 3, lineHeight: 1.4, marginLeft: 12 },
});

interface Block {
  type: "h2" | "h3" | "p" | "li";
  text: string;
}

function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = [];

  // Replace heading and list tags with sentinel markers, then extract text.
  const withMarkers = html
    .replace(/<h2[^>]*>/gi, "\x01H2\x03")
    .replace(/<\/h2>/gi, "\x02")
    .replace(/<h3[^>]*>/gi, "\x01H3\x03")
    .replace(/<\/h3>/gi, "\x02")
    .replace(/<li[^>]*>/gi, "\x01LI\x03")
    .replace(/<\/li>/gi, "\x02")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "");  // strip all remaining tags

  const decoded = withMarkers
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  const parts = decoded.split("\x01");
  for (const part of parts) {
    if (!part.trim()) continue;
    const match = part.match(/^(H2|H3|LI)\x03([\s\S]*)/);
    if (match) {
      const [, tag, raw] = match;
      const text = raw.replace("\x02", "").trim();
      if (!text) continue;
      if (tag === "H2") blocks.push({ type: "h2", text });
      else if (tag === "H3") blocks.push({ type: "h3", text });
      else blocks.push({ type: "li", text: `• ${text}` });
    } else {
      const remainder = part.replace("\x02", "");
      for (const line of remainder.split("\n")) {
        const text = line.trim();
        if (text) blocks.push({ type: "p", text });
      }
    }
  }

  return blocks;
}

function ResumeDocument({ title, content }: { title: string; content: string }) {
  const blocks = htmlToBlocks(content);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {blocks.map((block, i) => {
          if (block.type === "h2") return <Text key={i} style={styles.h2}>{block.text}</Text>;
          if (block.type === "h3") return <Text key={i} style={styles.h3}>{block.text}</Text>;
          if (block.type === "li") return <Text key={i} style={styles.bullet}>{block.text}</Text>;
          return <Text key={i} style={styles.paragraph}>{block.text}</Text>;
        })}
      </Page>
    </Document>
  );
}

export async function renderResumePdf(title: string, content: string): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument title={title} content={content} />);
}
