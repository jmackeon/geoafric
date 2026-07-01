import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const MODULE_NAMES: Record<string, string> = {
  enterprise:  'Enterprise Suite',
  logistics:   'Logistics & Fleet',
  reach:       'Reach',
  hospitality: 'Hospitality',
  unsure:      'Not sure yet',
};

export async function POST(req: NextRequest) {
  try {
    const { name, company, country, module, phone, message } = await req.json();

    if (!name || !company || !country || !module || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const moduleName = MODULE_NAMES[module] ?? module;
    const subject    = `New GeoAfric business enquiry — ${moduleName} — ${company}`;
    const text = [
      'New business enquiry from the GeoAfric website',
      `Submitted: ${new Date().toISOString()}`,
      '',
      `Name:     ${name}`,
      `Company:  ${company}`,
      `Country:  ${country}`,
      `Module:   ${moduleName}`,
      `Phone:    ${phone}`,
      `Message:  ${message || '(none provided)'}`,
    ].join('\n');

    await resend.emails.send({
      // Requires alphaztechnologies.com to be verified as a sender domain in your Resend dashboard at resend.com/domains — add their DNS records in Hostinger before going live.
      from:    'GeoAfric <noreply@alphaztechnologies.com>',
      to:      'james@alphaztechnologies.com',
      subject,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[enquiry]', err);
    return NextResponse.json({ error: 'Failed to send enquiry' }, { status: 500 });
  }
}
