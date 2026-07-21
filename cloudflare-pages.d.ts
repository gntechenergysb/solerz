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

// R2 Bucket types (minimal subset for upload-image function)
interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLanguage?: string;
  };
  customMetadata?: Record<string, string>;
}

interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: Record<string, string>;
}

interface R2Bucket {
  put(key: string, value: ArrayBuffer | ReadableStream | string | Blob, options?: R2PutOptions): Promise<R2Object>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ objects: R2Object[]; truncated: boolean; cursor?: string }>;
}
