// Minimal Cloudflare Pages Functions typings for this repo.
// This avoids pulling full @cloudflare/workers-types while keeping TS happy.

type Fetcher = {
  fetch: (request: Request) => Promise<Response>;
};

type EventContext<Env = unknown, Params extends string = string, Data = unknown> = {
  request: Request;
  env: Env;
  params: Record<Params, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
  data: Data;
};

type PagesFunction<Env = unknown, Params extends string = string, Data = unknown> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;
