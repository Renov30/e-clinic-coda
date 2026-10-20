import { NextResponse } from "next/server";
import { clinicConfigService } from "@/modules/clinic-config/service";

export async function GET() {
  const profile = await clinicConfigService.getClinicProfile();
  return NextResponse.json({ success: true, data: profile });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await clinicConfigService.updateClinicProfile(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Format request tidak valid" },
      { status: 400 }
    );
  }
}

