import { getCloudflareContext } from "@opennextjs/cloudflare";

type Result = {
	results: unknown[];
	success: boolean;
	meta: Record<string, unknown>;
};

// Minimal D1Database lookalike that talks to the Cloudflare D1 REST API, so the
// app can run outside Workers (e.g. Vercel). Only the methods the stores use.
async function queryResults(payload: {sql: string; params: unknown[]} | {batch: {sql: string; params: unknown[]}[]}): Promise<Result[]> {
	const {
		CLOUDFLARE_ACCOUNT_ID: account,
		CLOUDFLARE_D1_DATABASE_ID: database,
		CLOUDFLARE_API_TOKEN: token,
	} = process.env;
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			cache: "no-store",
		},
	);
	const body = (await response.json()) as {
		success: boolean;
		result?: Result[];
		errors?: { message: string }[];
	};
	if (!response.ok || !body.success || !body.result?.length || body.result.some(r => !r.success))
		throw new Error(
			"D1 REST error: " +
				(body.errors?.map((e) => e.message).join("; ") || response.status),
		);
	return body.result;
}

async function query(sql: string, params: unknown[]): Promise<Result> {
 return (await queryResults({sql,params}))[0];
}

class RestStatement {
	constructor(
		readonly sql: string,
		readonly params: unknown[] = [],
	) {}
	bind(...values: unknown[]) {
		return new RestStatement(this.sql, values);
	}
	run() {
		return query(this.sql, this.params);
	}
	async all() {
		return this.run();
	}
	async first(column?: string) {
		const row = (await this.run()).results[0] as
			| Record<string, unknown>
			| undefined;
		if (!row) return null;
		return column ? row[column] : row;
	}
}

const restDb = {
	prepare: (sql: string) => new RestStatement(sql),
	// Keep all statements in one D1 batch request for atomic payment and inventory updates.
	// https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/
	async batch(statements: RestStatement[]) {
		if (!statements.length) return [];
		const result = await queryResults({batch: statements.map(s => ({sql:s.sql,params:s.params}))});
		if(result.length!==statements.length) throw new Error("Incomplete D1 batch response");
		return result;
	},
};

export function getDb(): D1Database {
	if (
		process.env.CLOUDFLARE_D1_DATABASE_ID &&
		process.env.CLOUDFLARE_API_TOKEN &&
		process.env.CLOUDFLARE_ACCOUNT_ID
	)
		return restDb as unknown as D1Database;
	const { env } = getCloudflareContext();
	const db = (env as unknown as { DB?: D1Database }).DB;
	if (!db) throw new Error("Database unavailable");
	return db;
}
