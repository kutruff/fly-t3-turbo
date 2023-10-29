/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import superjson from "superjson";

import { api } from "~/utils/api";

function getBaseUrl() {  
  if (typeof window !== "undefined") return "";
  if (process.env.BASE_URL) return `${process.env.BASE_URL}`;
  
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  console.log(getBaseUrl());
  return getBaseUrl() + "/api/trpc";
}


// const ReactQueryDevtoolsProduction = lazy(() =>
//   import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(
//     (d) => ({
//       default: d.ReactQueryDevtools,
//     }),
//   ),
// )

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  headers?: Headers;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            //TODO: IMPORTANT decide if this is a good stale time
            // staleTime: 5 * 1000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: getUrl(),
          headers() {
            const headers = new Map(props.headers);
            headers.set("x-trpc-source", "nextjs-react");
            return Object.fromEntries(headers);
          },
        }),
      ],
    }),
  );
  
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
          {props.children}
        <ReactQueryDevtools initialIsOpen={false} />
        {/* <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense> */}
      </QueryClientProvider>
    </api.Provider>
  );
}
