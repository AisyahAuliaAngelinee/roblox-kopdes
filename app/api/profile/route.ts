import { getDb } from "@/db";
import { readProfile, writeProfile } from "@/db/profile-store";
import { getUser, json, sameOrigin } from "@/lib/auth";
import { profileSchema, emptyProfile } from "@/lib/profile";
export async function GET(request: Request) {
	const user = await getUser(request);
	if (!user) return json({ error: "Silakan masuk terlebih dahulu." }, 401);
	try {
		const row = await readProfile(getDb(), user.id);
		return json({
			profile: row ? profileSchema.parse(JSON.parse(row.data)) : emptyProfile,
			version: row?.version ?? 0,
		});
	} catch (error) {
		logProfileFailure("read", error);
		return json({ error: "Data akun belum dapat dimuat. Coba kembali." }, 503);
	}
}
export async function PUT(request: Request) {
	if (!sameOrigin(request))
		return json({ error: "Permintaan tidak diizinkan." }, 403);
	const user = await getUser(request);
	if (!user)
		return json(
			{ error: "Sesi telah berakhir. Masuk kembali untuk menyimpan." },
			401,
		);
	let body: any;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Data tidak valid." }, 400);
	}
	const parsed = profileSchema.safeParse(body?.profile);
	if (!parsed.success || !Number.isInteger(body?.version) || body.version < 0)
		return json({ error: "Periksa kembali data alamat atau favorit." }, 400);
	try {
		const version = await writeProfile(
			getDb(),
			user.id,
			JSON.stringify(parsed.data),
			body.version,
		);
		if (version === null)
			return json(
				{
					error:
						"Data berubah di tab lain. Muat ulang halaman lalu coba kembali.",
				},
				409,
			);
		return json({ profile: parsed.data, version });
	} catch (error) {
		logProfileFailure("write", error);
		return json(
			{ error: "Belum berhasil menyimpan. Data sebelumnya tetap aman." },
			503,
		);
	}
}

// Log only a diagnostic category; never log profile data, cookies or API credentials.
function logProfileFailure(operation: string, error: unknown) {
 const message = error instanceof Error ? error.message : '';
 const reason = message.includes('D1_CONFIGURATION_MISSING') ? 'database_configuration_missing'
  : message.includes('no such table') ? 'database_schema_missing'
  : message.includes('D1 REST error') ? 'database_connection_or_permission_failed'
  : 'database_or_profile_validation_failed';
 console.error('profile_' + operation + '_unavailable', {reason});
}
