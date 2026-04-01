import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://vi-notes-client.vercel.app",
  config.CLIENT_ORIGIN,
];

const isAllowedVercelOrigin = (origin: string) => {
  return /^https:\/\/vi-notes-client(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);
};

const isAllowedDevOrigin = (origin: string) => {
  return (
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):\d+$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.devtunnels\.ms$/.test(origin)
  );
};

const validateVercelOriginMatcher = () => {
  const cases: Array<{ origin: string; expected: boolean }> = [
    {
      origin: "https://vi-notes-client.vercel.app",
      expected: true,
    },
    {
      origin:
        "https://vi-notes-client-60ejdz2qf-shivams-projects-04261c20.vercel.app",
      expected: true,
    },
    {
      origin: "https://vi-notes-client-ab12cd3-scope-12345.vercel.app",
      expected: true,
    },
    {
      origin: "https://vi-notes-client--bad.vercel.app",
      expected: true,
    },
    {
      origin: "https://vi-notes-evil.vercel.app",
      expected: false,
    },
    {
      origin: "https://other-app.vercel.app",
      expected: false,
    },
    {
      origin: "http://vi-notes-client.vercel.app",
      expected: false,
    },
  ];

  for (const testCase of cases) {
    const actual = isAllowedVercelOrigin(testCase.origin);
    if (actual !== testCase.expected) {
      throw new Error(
        `Vercel origin matcher failed for ${testCase.origin}. Expected ${testCase.expected}, got ${actual}`,
      );
    }
  }
};

if (config.NODE_ENV !== "production") {
  validateVercelOriginMatcher();
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      isAllowedVercelOrigin(origin)
    ) {
      callback(null, true);
      return;
    }

    if (config.NODE_ENV !== "production" && isAllowedDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
