import { NextResponse } from 'next/server';

const DEFAULT_APK_URL =
  'https://expo.dev/artifacts/eas/vralxWg324YtcJoP86z299FLb7vRTqZki05Qsm6gdYE.apk';

export async function GET() {
  const targetUrl = process.env.NEXT_PUBLIC_APK_URL || DEFAULT_APK_URL;
  return NextResponse.redirect(targetUrl, { status: 302 });
}
