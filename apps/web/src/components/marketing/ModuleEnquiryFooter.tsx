import Link from 'next/link';
import { BusinessEnquiryForm } from './BusinessEnquiryForm';

export function ModuleEnquiryFooter({ defaultModule }: { defaultModule: string }) {
  return (
    <>
      <BusinessEnquiryForm defaultModule={defaultModule} />
      <div className="bg-white pb-16 text-center">
        <p className="text-sm text-gray-400">
          Not the right module?{' '}
          <Link href="/business" className="font-semibold text-navy hover:underline">
            Explore all modules →
          </Link>
        </p>
      </div>
    </>
  );
}
