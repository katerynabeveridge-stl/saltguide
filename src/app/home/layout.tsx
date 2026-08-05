import { DM_Serif_Display, Outfit } from "next/font/google";
import "./shell.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

const serif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`sg ${display.variable} ${serif.variable} ${body.variable}`}>
      <div className="sg-bg" aria-hidden="true">
        <img src="/salt-background.png" alt="" />
        <div className="sg-bg-wash" />
      </div>
      {children}
    </div>
  );
}
