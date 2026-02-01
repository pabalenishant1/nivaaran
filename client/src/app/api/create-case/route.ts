import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

// POST /api/create-case
// Accepts either multipart/form-data (with file) or JSON with { patientData, ocrText }
// and forwards to the Express server to centralize OCR + AI processing
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Multipart: forward directly to server /create-case
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      const serverResp = await fetch(`${BACKEND_URL}/create-case`, {
        method: 'POST',
        body: formData,
      });

      if (!serverResp.ok) {
        const text = await serverResp.text();
        return NextResponse.json({ error: text }, { status: serverResp.status });
      }
      const data = await serverResp.json();
      return NextResponse.json(data);
    }

    // JSON: forward to server /api/create-case
    const json = await req.json();
    const serverResp = await fetch(`${BACKEND_URL}/api/create-case`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    });

    if (!serverResp.ok) {
      const text = await serverResp.text();
      return NextResponse.json({ error: text }, { status: serverResp.status });
    }
    const data = await serverResp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}
