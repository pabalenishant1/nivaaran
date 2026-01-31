import { NextResponse } from 'next/server';

// GET /api/cases
// Proxies to the Express server to keep the client code simple
export async function GET() {
  try {
    const resp = await fetch('http://localhost:4000/api/cases');
    if (!resp.ok) {
      // Fallback to legacy path if alias not available
      const legacy = await fetch('http://localhost:4000/cases');
      if (!legacy.ok) {
        const text = await legacy.text();
        return NextResponse.json({ error: text }, { status: legacy.status });
      }
      const cases = await legacy.json();
      return NextResponse.json(cases);
    }
    const cases = await resp.json();
    return NextResponse.json(cases);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}
