import type { Metadata } from 'next';
import { BusinessHero }        from '@/components/marketing/BusinessHero';
import { HowItWorks }          from '@/components/marketing/HowItWorks';
import { ModuleCards }         from '@/components/marketing/ModuleCards';
import { BusinessEnquiryForm } from '@/components/marketing/BusinessEnquiryForm';

export const metadata: Metadata = {
  title: 'GeoAfric for Business — Enterprise, Fleet, Reach & Hospitality',
  description:
    'GeoAfric deploys enterprise intelligence, fleet management, hospitality tools, and marketing reach — on one platform, backed by hands-on local support.',
};

interface Props {
  searchParams: { module?: string };
}

export default function BusinessPage({ searchParams }: Props) {
  const defaultModule = searchParams.module ?? '';

  return (
    <>
      <BusinessHero />
      <HowItWorks />
      <ModuleCards />
      <BusinessEnquiryForm defaultModule={defaultModule} />
    </>
  );
}
