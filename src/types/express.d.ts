declare module 'express' {
  interface Request {
    user?: {
      id: number;
      email: string;
      name?: string;
    };
  }
}
