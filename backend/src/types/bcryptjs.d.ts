declare module 'bcryptjs' {
  export function genSalt(rounds?: number | string, callback?: (err: Error, salt: string) => void): Promise<string> | void;
  export function hash(data: string | Buffer, salt: string | number, callback?: (err: Error, encrypted: string) => void): Promise<string> | void;
  export function compare(data: string | Buffer, encrypted: string, callback?: (err: Error, same: boolean) => void): Promise<boolean> | void;
  export function getRounds(encrypted: string): number;
}
