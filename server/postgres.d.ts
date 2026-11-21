type Statement={bind(...values:unknown[]):Statement;all():Promise<{results:Record<string,unknown>[]}>;first():Promise<Record<string,unknown>|null>;run():Promise<unknown>};
export type Database={prepare(sql:string):Statement;batch(statements:Statement[]):Promise<unknown[]>};
export function getDatabase():Database|null;
export function postgresQuery(sql:string):string;
