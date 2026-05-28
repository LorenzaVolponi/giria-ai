import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import AdminLoading from "../src/app/admin/loading";
import AdminError from "../src/app/admin/error";
import AdminPage from "../src/app/admin/page";

describe("admin route UI shells", () => {
  it("renders admin loading shell", () => {
    const html = renderToString(React.createElement(AdminLoading));
    expect(html).toContain("Carregando painel admin");
  });

  it("renders admin login shell without browser globals", () => {
    const html = renderToString(React.createElement(AdminPage));
    expect(html).toContain("Dashboard Admin");
    expect(html).toContain("Entrar no admin");
  });

  it("renders admin error shell", () => {
    const reset = vi.fn();
    const html = renderToString(React.createElement(AdminError, { error: new Error("boom"), reset }));
    expect(html).toContain("Falha ao carregar o painel admin");
    expect(html).toContain("Tentar novamente");
  });
});
