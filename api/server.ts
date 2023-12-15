import Koa from 'koa';
import session from 'koa-session';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

const app = new Koa();
const router = new Router();
const port = 3000;

app.keys = ['4468fe8c-4c7c-4af6-b65b-886bbde33820']; // needed for cookie-signing

app.use(async (ctx, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
  const origin = ctx.request.get('Origin');
  if (!origin) {
    await next();
    return;
  }

  //   const originWithoutPort = origin.split(':')[0] + ':' + origin.split(':')[1]; // remove port from origin
  const validOrigin = allowedOrigins.includes(origin);
  if (!validOrigin) {
    ctx.throw(403, 'Forbidden');
    return;
  }

  ctx.set('Access-Control-Allow-Origin', origin);
  ctx.set('Access-Control-Allow-Credentials', 'true');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type');

  if (ctx.request.method === 'OPTIONS') {
    ctx.status = 200;
    return;
  }

  await next();
});

app.use(
  session(
    {
      //   domain: '.localtest.me',
      secure: false, // set to true if you're using HTTPS
      httpOnly: false, // set to true if you want to prevent access to the cookie from JavaScript
      sameSite: 'lax', // set to 'lax' or 'strict' for more restrictions,
      signed: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
    app
  )
);
app.use(bodyParser());

router.get('/login', async (ctx) => {
  const session = ctx.session!;
  const origin = ctx.request.headers.origin;

  if (session && session.user) {
    ctx.body = {
      isLoggedIn: true,
      user: session.user,
      message: `Logged in from ${origin}! User: ${JSON.stringify(
        session.user
      )}`,
    };
  } else {
    ctx.body = { isLoggedIn: false };
  }
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as {
    username: string;
    password: string;
  };

  const user = { id: 1, name: 'John Doe', username, password };
  const origin = ctx.request.headers.origin;

  if (ctx.session) {
    ctx.session.user = user;
    ctx.body = {
      isLoggedIn: true,
      user,
      message: `Logged in from ${origin}! User: ${JSON.stringify(user)}`,
    };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
