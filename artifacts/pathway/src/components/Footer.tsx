import PinSaveModal from "./PinSaveModal";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 40,
        paddingBottom: 24,
        textAlign: "center",
        fontSize: 12,
        color: "hsl(var(--ink-soft))",
        fontFamily: "Verdana, Geneva, sans-serif",
        lineHeight: 1.6,
        opacity: 0.7,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <PinSaveModal />
      <a
        href="https://creativecommons.org/licenses/by-nc/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "inherit",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        ADHDrive © 2026 by Rashid Khzai is licensed under Creative Commons Attribution-NonCommercial 4.0 International
      </a>
    </footer>
  );
}
