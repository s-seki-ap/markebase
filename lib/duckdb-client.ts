/**
 * DuckDB-WASM client-side SQL execution for quiz & sandbox.
 * Uses dynamic import to avoid pulling DuckDB into server bundles.
 */

export interface SampleTable {
  tableName: string;
  columns: string[];
  rows: (string | number | null)[][];
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  const duckdb = await import("@duckdb/duckdb-wasm");
  const DUCKDB_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);

  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  dbInstance = db;
  return db;
}

/**
 * Execute SQL against in-memory DuckDB with sample data tables.
 */
export async function executeSQLWithSampleData(
  sampleData: SampleTable[],
  sql: string
): Promise<QueryResult> {
  const db = await getDB();
  const conn = await db.connect();

  try {
    // Create and populate sample tables
    for (const table of sampleData) {
      await conn.query(`DROP TABLE IF EXISTS ${table.tableName}`);

      const colDefs = table.columns.map((col: string, ci: number) => {
        const sampleVal = table.rows[0]?.[ci];
        const colType = typeof sampleVal === "number" ? "DOUBLE" : "VARCHAR";
        return `"${col}" ${colType}`;
      });
      await conn.query(`CREATE TABLE ${table.tableName} (${colDefs.join(", ")})`);

      for (const row of table.rows) {
        const values = row.map((v) => {
          if (v === null) return "NULL";
          if (typeof v === "number") return String(v);
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        await conn.query(`INSERT INTO ${table.tableName} VALUES (${values.join(", ")})`);
      }
    }

    // Execute user SQL
    const result = await conn.query(sql);
    const schema = result.schema.fields.map((f: { name: string }) => f.name);
    const rows: (string | number | null)[][] = [];

    for (let i = 0; i < result.numRows; i++) {
      const row: (string | number | null)[] = [];
      for (let j = 0; j < schema.length; j++) {
        const col = result.getChildAt(j);
        const val = col?.get(i);
        if (val === null || val === undefined) {
          row.push(null);
        } else if (typeof val === "bigint") {
          row.push(Number(val));
        } else {
          row.push(val);
        }
      }
      rows.push(row);
    }

    return { columns: schema, rows };
  } finally {
    await conn.close();
  }
}
