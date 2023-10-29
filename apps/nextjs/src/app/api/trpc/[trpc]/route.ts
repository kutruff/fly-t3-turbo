import type { NextRequest } from 'next/server';
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { env } from "~/env.mjs";
import { appRouter, createTRPCContext } from '@acme/api';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };

//TODO: see if there's any cross origin stuff here to consider from the T3 turbo example
// import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// import { appRouter, createTRPCContext } from "@acme/api";
// import { auth } from "@acme/auth";

// // export const runtime = "edge";

// /**
//  * Configure basic CORS headers
//  * You should extend this to match your needs
//  */
// function setCorsHeaders(res: Response) {
//   res.headers.set("Access-Control-Allow-Origin", "*");
//   res.headers.set("Access-Control-Request-Method", "*");
//   res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
//   res.headers.set("Access-Control-Allow-Headers", "*");
// }

// export function OPTIONS() {
//   const response = new Response(null, {
//     status: 204,
//   });
//   setCorsHeaders(response);
//   return response;
// }

// const handler = auth(async (req) => {
//   const response = await fetchRequestHandler({
//     endpoint: "/api/trpc",
//     router: appRouter,
//     req,
//     createContext: () => createTRPCContext({ auth: req.auth, req }),
//     onError({ error, path }) {
//       console.error(`>>> tRPC Error on '${path}'`, error);
//     },
//   });

//   setCorsHeaders(response);
//   return response;
// });

// export { handler as GET, handler as POST };
