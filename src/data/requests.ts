export type TState = 'pending' | 'validated' | 'archived';
export type TDev = 'dev' | 'sales' | 'ops' | 'marketing';

export interface IDBRequest {
  id: string;
  user: {
    fullName: string;
    email: string;
    age: number;
    role: TDev;
  };
  createdAt: number; // milliseconds
  state: TState;
}

export default [
  {
    id: '123',
    user: {
      fullName: 'Victor Dupuy',
      email: 'victor@skillup.co',
      age: 28,
      role: 'dev',
    },
    createdAt: new Date().valueOf(),
    state: 'pending',
  }
] as IDBRequest[];
