import { afterEach, describe, expect, it, vi } from "vitest";
import {
  browserApiBaseUrl,
  DEV_API_PROXY_PATH,
  devApiProxyRewrites,
} from "./devApiProxy";

const ALLOWED =
  "https://api.example.com/admin/, http://172.20.1.141:9998, http://8.8.8.8/admin";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("devApiProxyRewrites", () => {
  it("maps each valid allowed address to its own numbered path, same-origin requests only", () => {
    expect(devApiProxyRewrites(ALLOWED)).toEqual([
      {
        source: `${DEV_API_PROXY_PATH}/0/:path*`,
        destination: "https://api.example.com/admin/:path*",
        has: [{ type: "header", key: "sec-fetch-site", value: "(same-origin|none)" }],
      },
      {
        source: `${DEV_API_PROXY_PATH}/1/:path*`,
        destination: "http://172.20.1.141:9998/:path*",
        has: [{ type: "header", key: "sec-fetch-site", value: "(same-origin|none)" }],
      },
    ]);
  });

  it("has nothing to forward without allowed addresses", () => {
    expect(devApiProxyRewrites(undefined)).toEqual([]);
  });
});

describe("browserApiBaseUrl", () => {
  it("sends the browser through the proxy during next dev", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(browserApiBaseUrl("http://172.20.1.141:9998", ALLOWED)).toBe(
      `${DEV_API_PROXY_PATH}/1`,
    );
  });

  it("calls the API directly outside next dev", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(browserApiBaseUrl("https://api.example.com/admin", ALLOWED)).toBe(
      "https://api.example.com/admin",
    );
  });
});
