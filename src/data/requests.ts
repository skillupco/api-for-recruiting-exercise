import uuid from 'uuid/v4';

export type TState = 'pending' | 'validated' | 'archived';
export type TRole = 'dev' | 'sales' | 'ops' | 'marketing';

export interface IDBRequest {
  id: string;
  message: string;
  user: {
    fullName: string;
    email: string;
    age: number;
    role: TRole;
  };
  createdAt: number; // milliseconds
  state: TState;
}

export default [
  {
    id: uuid(),
    message: 'Racheter du café !',
    user: {
      fullName: 'Victor Dupuy',
      email: 'victor@skillup.co',
      age: 28,
      role: 'dev',
    },
    createdAt: new Date().valueOf(),
    state: 'pending',
  },
  {
    id: uuid(),
    message: 'Besoin d\'une souris et d\'un clavier',
    user: {
      fullName: 'Nicolas Durand',
      email: 'nicolas@skillup.co',
      age: 32,
      role: 'sales',
    },
    createdAt: new Date().valueOf(),
    state: 'pending',
  },
  {
    id: uuid(),
    message: 'Besoin de me former sur AdWords.',
    user: {
      fullName: 'Hélène Dupond',
      email: 'helene@skillup.co',
      age: 22,
      role: 'marketing',
    },
    createdAt: new Date().valueOf(),
    state: 'validated',
  },
  {
    id: uuid(),
    message: 'Besoin d\'un nouveau téléphone avec une meilleure batterie',
    user: {
      fullName: 'Xi Li',
      email: 'xi@skillup.co',
      age: 24,
      role: 'ops',
    },
    createdAt: new Date().valueOf(),
    state: 'validated',
  },
  {
    id: uuid(),
    message: 'Besoin de me former sur Sketch.',
    user: {
      fullName: 'Selim Ben Ammar',
      email: 'Selim@skillup.co',
      age: 25,
      role: 'dev',
    },
    createdAt: new Date().valueOf(),
    state: 'archived',
  },
] as IDBRequest[];
