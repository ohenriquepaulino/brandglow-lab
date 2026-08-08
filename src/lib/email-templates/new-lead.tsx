import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  nome?: string;
  whatsapp?: string;
  instagram?: string;
  faturamento?: string;
  profissao?: string;

  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  recebido_em?: string;
}

const NewLeadEmail = ({
  nome = "Sem nome",
  whatsapp = "—",
  instagram = "—",
  faturamento = "—",
  profissao = "—",

  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term,
  recebido_em,
}: Props) => {
  const utms = [
    ["Source", utm_source],
    ["Medium", utm_medium],
    ["Campaign", utm_campaign],
    ["Content", utm_content],
    ["Term", utm_term],
  ].filter(([, v]) => v) as Array<[string, string]>;

  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Novo lead: {nome} — {faturamento}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={badge}>
            <Text style={badgeText}>NOVO LEAD</Text>
          </Section>
          <Heading style={h1}>{nome}</Heading>
          <Text style={subtle}>
            Recebido em {recebido_em ?? new Date().toLocaleString("pt-BR")}
          </Text>

          <Hr style={hr} />

          <Row label="WhatsApp" value={whatsapp} />
          <Row label="Instagram" value={instagram} />
          <Row label="Faturamento mensal" value={faturamento} />

          {utms.length > 0 && (
            <>
              <Hr style={hr} />
              <Text style={sectionTitle}>Origem (UTM)</Text>
              {utms.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
            </>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Acesse o CRM para mover este lead pelo funil.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={rowText}>
      <span style={rowLabel}>{label}: </span>
      <span style={rowValue}>{value}</span>
    </Text>
  );
}

export const template = {
  component: NewLeadEmail,
  subject: (d: Record<string, any>) =>
    `Novo lead — ${d?.nome ?? "Legacy BrandCo."}`,
  displayName: "Notificação de novo lead",
  to: "hpaulino.05@gmail.com",
  previewData: {
    nome: "Maria Souza",
    whatsapp: "(11) 99999-0000",
    instagram: "@maria.marca",
    faturamento: "De R$ 10.000 a R$ 20.000",
    utm_source: "instagram",
    utm_medium: "bio",
    utm_campaign: "lancamento",
    recebido_em: new Date().toLocaleString("pt-BR"),
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
const sectionTitle = {
  fontSize: "11px",
  letterSpacing: "0.18em",
  color: "#6b6a65",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};
const rowText = { fontSize: "15px", color: "#121110", margin: "6px 0", lineHeight: 1.5 };
const rowLabel = { color: "#6b6a65" };
const rowValue = { color: "#121110", fontWeight: 500 };
const footer = { fontSize: "13px", color: "#6b6a65", margin: 0 };
