import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { CTASection } from '@/components/home/CTASection';
import Chatbot from '@/components/Chatbot';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <ProductsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Chatbot />
    </Layout>
  );
};

export default Index;
