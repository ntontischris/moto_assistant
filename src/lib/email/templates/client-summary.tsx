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

interface ClientSummaryEmailProps {
  clientName: string;
  progress: number;
  isComplete: boolean;
  resumeUrl?: string;
}

export function ClientSummaryEmail({
  clientName,
  progress,
  isComplete,
  resumeUrl,
}: ClientSummaryEmailProps) {
  const previewText = isComplete
    ? "Thank you for completing your MotoMarket session!"
    : `Your MotoMarket session is ${progress}% complete`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>MotoMarket</Heading>

          <Section style={sectionStyle}>
            <Text style={greetingStyle}>{clientName},</Text>

            {isComplete ? (
              <Text style={bodyTextStyle}>
                Thank you for completing your discovery session! Our team will
                review your responses and get back to you shortly with a
                tailored proposal.
              </Text>
            ) : (
              <>
                <Text style={bodyTextStyle}>
                  Thank you for your time today. Your session is{" "}
                  <strong>{progress}%</strong> complete.
                </Text>
                <Text style={bodyTextStyle}>
                  You can resume where you left off at any time using the link
                  below. Your progress has been saved.
                </Text>
              </>
            )}
          </Section>

          <Section style={progressSection}>
            <Text style={progressLabel}>Progress</Text>
            <div style={progressBarOuter}>
              <div
                style={{
                  ...progressBarInner,
                  width: `${progress}%`,
                }}
              />
            </div>
            <Text style={progressText}>{progress}%</Text>
          </Section>

          {!isComplete && resumeUrl && (
            <>
              <Hr style={hrStyle} />
              <Section style={ctaSection}>
                <Button href={resumeUrl} style={buttonStyle}>
                  Resume Session
                </Button>
              </Section>
            </>
          )}

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            If you have any questions, reply to this email or contact us at
            info@motomarket.gr.
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
  fontSize: "24px",
  fontWeight: "700",
  color: MOTO_RED,
  marginBottom: "24px",
};

const sectionStyle: React.CSSProperties = {
  padding: "0",
};

const greetingStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
};

const progressSection: React.CSSProperties = {
  padding: "16px 0",
};

const progressLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

const progressBarOuter: React.CSSProperties = {
  backgroundColor: "#e5e7eb",
  borderRadius: "9999px",
  height: "8px",
  width: "100%",
  overflow: "hidden",
};

const progressBarInner: React.CSSProperties = {
  backgroundColor: MOTO_RED,
  height: "8px",
  borderRadius: "9999px",
};

const progressText: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111827",
  marginTop: "4px",
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
