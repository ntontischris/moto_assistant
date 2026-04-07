import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const MOTO_RED = "#E31937";

interface AdminSummaryEmailProps {
  clientName: string;
  mode: "discovery" | "support";
  progress: number;
  summary: string;
  featureRequestCount: number;
  unansweredCount: number;
  dashboardUrl: string;
}

export function AdminSummaryEmail({
  clientName,
  mode,
  progress,
  summary,
  featureRequestCount,
  unansweredCount,
  dashboardUrl,
}: AdminSummaryEmailProps) {
  const modeLabel = mode === "discovery" ? "Discovery" : "Support";
  const previewText = `${modeLabel} call with ${clientName} - ${progress}% complete`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>
            Moto Assistant - {modeLabel} Call Summary
          </Heading>

          <Section style={sectionStyle}>
            <Text style={labelStyle}>Client</Text>
            <Text style={valueStyle}>{clientName}</Text>

            <Text style={labelStyle}>Progress</Text>
            <Text style={valueStyle}>{progress}%</Text>

            <Text style={labelStyle}>Feature Requests</Text>
            <Text style={valueStyle}>{featureRequestCount}</Text>

            <Text style={labelStyle}>Unanswered Questions</Text>
            <Text style={valueStyle}>{unansweredCount}</Text>
          </Section>

          <Hr style={hrStyle} />

          <Section style={sectionStyle}>
            <Heading as="h3" style={subheadingStyle}>
              Summary
            </Heading>
            <Text style={summaryStyle}>{summary}</Text>
          </Section>

          <Hr style={hrStyle} />

          <Section style={ctaSection}>
            <Button href={dashboardUrl} style={buttonStyle}>
              View in Dashboard
            </Button>
          </Section>

          <Text style={footerStyle}>
            This is an automated notification from Moto Assistant.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  maxWidth: "580px",
  borderRadius: "8px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px",
};

const subheadingStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "8px",
};

const sectionStyle: React.CSSProperties = {
  padding: "0",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "2px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#111827",
  marginTop: "0",
  marginBottom: "16px",
};

const summaryStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap" as const,
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: MOTO_RED,
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
};

const footerStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  marginTop: "32px",
};
