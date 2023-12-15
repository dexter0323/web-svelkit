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
    // Check if the user is already logged in
    ctx.body = {
      isLoggedIn: true,
      user: session.user,
      message: `Logged in from ${origin}! User: ${JSON.stringify(
        session.user
      )}`,
    };
  } else {
    // If the user is not logged in, return a response indicating that the user is not logged in
    ctx.body = { isLoggedIn: false };
  }
});

// Define a route for logging in
router.post('/login', async (ctx) => {
  // Extract the username and password from the request body
  const { username, password } = ctx.request.body as {
    username: string;
    password: string;
  };

  // Create a user object with the provided username and password
  const user = { id: 1, name: 'John Doe', username, password };
  // Get the origin of the request
  const origin = ctx.request.headers.origin;

  // If a session exists for the user
  if (ctx.session) {
    // Store the user object in the session
    ctx.session.user = user;
    // Return a response indicating that the user is logged in
    ctx.body = {
      isLoggedIn: true,
      user,
      message: `Logged in from ${origin}! User: ${JSON.stringify(user)}`,
    };
  }
});

// Use the defined routes and allowed methods in the Koa application
app.use(router.routes()).use(router.allowedMethods());

// Start the Koa server on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
