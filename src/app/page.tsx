// src/app/page.tsx
import Header from "../components/Header";
import HeroSection from "../sections/HeroSection";
import UploadSection from "../sections/UploadSection";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <UploadSection />
    </main>
  );
}
