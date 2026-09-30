import React from "react";
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

// Aviso das apresentações em vídeo (/v/:slug): "abriu" na hora e o resumo
// quando a pessoa para de assistir. O texto vem pronto de video.server.ts,
// o mesmo que vai para o grupo do WhatsApp.
interface Props {
  selo?: string;
  destinatario?: string;
  video?: string;
  linhas?: string[];
  quando?: string;
}

const VideoAvisoEmail = ({
  selo = "APRESENTAÇÃO",
  destinatario = "Sem nome",
  video = "",
  linhas = [],
  quando,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>
      {destinatario} · {selo.toLowerCase()}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={badge}>
          <Text style={badgeText}>{selo}</Text>
        </Section>
        <Heading style={h1}>{destinatario}</Heading>
        <Text style={subtle}>
          {video}
          {quando ? ` · ${quando}` : ""}
        </Text>

        <Hr style={hr} />

        {linhas.map((l, i) => (
          <Text key={i} style={rowText}>
            {l}
          </Text>
        ))}

        <Hr style={hr} />
        <Text style={footer}>Os detalhes de cada visita ficam em Vídeos, no CRM.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: VideoAvisoEmail,
  subject: (d: Record<string, any>) =>
    `${d?.assunto ?? "Apresentação"} — ${d?.destinatario ?? "Legacy BrandCo."}`,
  displayName: "Aviso de apresentação em vídeo",
  to: "hpaulino.05@gmail.com",
  previewData: {
    selo: "RESUMO DO VÍDEO",
    assunto: "Assistiu 72%",
    destinatario: "Maria Souza",
    video: "Apresentação Legacy",
    linhas: [
      "Assistiu 72% (8:40 de 12:00)",
      "Parou em 8:40",
      "Voltou para rever: 6:10",
      "No celular · 1ª visita",
    ],
    quando: new Date().toLocaleString("pt-BR"),
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Inter, Arial, sans-serif" };
const container = { padding: "32px 28px", maxWidth: "560px", margin: "0 auto" };
const badge = { marginBottom: "16px" };
const badgeText = {
  display: "inline-block",
  backgroundColor: "#CFFF87",
  color: "#121110",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  margin: 0,
};
const h1 = { color: "#121110", fontSize: "28px", fontWeight: 700, margin: "8px 0 4px" };
const subtle = { color: "#6b6a65", fontSize: "13px", margin: 0 };
const hr = { borderColor: "#eeece8", margin: "24px 0" };
const rowText = { fontSize: "15px", color: "#121110", margin: "6px 0", lineHeight: 1.5 };
const footer = { fontSize: "13px", color: "#6b6a65", margin: 0 };
