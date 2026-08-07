import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '@/components/ui/Button';
import ReserveNowLink from '@/components/routing/ReserveNowLink';
import CourtTypesSection from '@/pages/landing/CourtTypesSection';
import Features from '@/pages/landing/Features';
import Footer from '@/pages/landing/Footer';
import Gallery from '@/pages/landing/Gallery';
import Hero from '@/pages/landing/Hero';
import HowItWorks from '@/pages/landing/HowItWorks';
import LandingNavbar from '@/pages/landing/LandingNavbar';
import Testimonials from '@/pages/landing/Testimonials';

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface">
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <CourtTypesSection />
        <Gallery />
        <HowItWorks />
        <Testimonials />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#064e3b_0%,#059669_50%,#10b981_100%)] px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  ¿Listo para reservar tu cancha?
                </h2>
                <p className="mt-4 text-base text-white/85 sm:text-lg">
                  Crea tu cuenta, elige tu horario favorito y confirma tu reserva en pocos pasos.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <ReserveNowLink
                    size="lg"
                    variant="secondary"
                    buttonClassName="bg-white text-emerald-800 hover:bg-white/90"
                    rightIcon={<ArrowRight className="size-4" />}
                  >
                    Reservar ahora
                  </ReserveNowLink>
                  <Link to="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 bg-transparent text-white hover:bg-white/10"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
