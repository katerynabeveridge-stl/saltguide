import { Poppins } from "next/font/google";
import "./shell.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`sg ${poppins.variable}`}>
      <div className="sg-bg" aria-hidden="true" />
      {children}
    </div>
  );
}
