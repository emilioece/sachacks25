import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard'
  }),
  callback: handleCallback({
    afterCallback: (_req: any, _res: any, session: any) => {
      return session;
    }
  })
});

export const POST = handleAuth(); 