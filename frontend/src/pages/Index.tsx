import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { ValuePropositionSection } from '@/components/home/ValuePropositionSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { BrandShowcase } from '@/components/BrandShowcase';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { ExpertiseSection } from '@/components/home/ExpertiseSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ValuePropositionSection />
      <ServicesSection />
      <ProductsSection />
      <BrandShowcase />
      <BenefitsSection />
      <ExpertiseSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
