import { useCallback, useEffect, useRef, useState } from "react";

const LEGACY_KEY = "ficha-mutantes-malfeitores-react-v1";
const messages = {
  LOGIN_REQUIRED: "Sua sessão expirou. Entre novamente para abrir a ficha.",
  ACCESS_DENIED: "Esta conta precisa fazer parte do grupo fichamutantes.",
  AUTH_UNAVAILABLE: "A autenticação está indisponível. Tente novamente.",
  DATABASE_UNAVAILABLE: "Não foi possível acessar o banco. Suas alterações ainda não foram salvas.",
  CONNECTION_FAILED: "Sem conexão com o servidor. Suas alterações ainda não foram salvas.",
  SHEET_CONFLICT: "A ficha foi alterada em outra aba ou dispositivo. Recarregue antes de continuar.",
  SHEET_TOO_LARGE: "A ficha excede o tamanho permitido. Reduza os textos antes de salvar.",
  INVALID_SHEET: "Algum campo excede o limite permitido. Revise os textos antes de salvar.",
};

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "same-origin",
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json", ...options.headers },
    });
  } catch {
    throw Object.assign(new Error(messages.CONNECTION_FAILED), { code: "CONNECTION_FAILED" });
  }
  if (response.type === "opaqueredirect" || response.status === 401) {
    throw Object.assign(new Error(messages.LOGIN_REQUIRED), { code: "LOGIN_REQUIRED" });
  }
  const isJson = response.headers.get("Content-Type")?.includes("application/json");
  if (response.status === 403 && !isJson) {
    throw Object.assign(new Error(messages.ACCESS_DENIED), { code: "ACCESS_DENIED" });
  }
  if (!isJson) {
    throw Object.assign(new Error(messages.CONNECTION_FAILED), { code: "CONNECTION_FAILED" });
  }
  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(messages[data.error] || "Não foi possível salvar. Tente novamente."), { code: data.error });
  }
  return data;
}

function legacyForm(user, exists) {
  if (user.username !== "pyu" || exists) return null;
  try {
    const form = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    return form && typeof form === "object" && !Array.isArray(form) && Object.keys(form).length ? form : null;
  } catch {
    return null;
  }
}

export function useAccountSheet() {
  const [state, setState] = useState({
    form: {}, user: null, revision: 0, ready: false, loading: true,
    dirty: false, saving: false, failure: "", status: "Carregando sua ficha…", legacy: null,
  });
  const current = useRef(state);
  const generation = useRef(0);
  const mounted = useRef(false);
  const patch = useCallback(values => {
    current.current = { ...current.current, ...values };
    if (mounted.current) setState(current.current);
  }, []);

  const load = useCallback(async () => {
    const version = ++generation.current;
    patch({ ready: false, loading: true, dirty: false, saving: false, user: null, form: {}, legacy: null, failure: "", status: "Carregando sua ficha…" });
    try {
      const { user, sheet } = await request("/api/sheet");
      if (!mounted.current || version !== generation.current) return;
      patch({
        user, form: sheet.form, revision: sheet.revision, ready: true, loading: false,
        status: sheet.exists ? "Ficha carregada da sua conta." : "Sua ficha está vazia.",
        legacy: legacyForm(user, sheet.exists),
      });
    } catch (error) {
      if (mounted.current && version === generation.current) {
        patch({ loading: false, failure: error.code, status: error.message });
      }
    }
  }, [patch]);

  const save = useCallback(async () => {
    const snapshot = current.current;
    if (!snapshot.ready || snapshot.saving || snapshot.failure === "SHEET_CONFLICT") return;
    const version = generation.current;
    patch({ saving: true, failure: "", status: "Salvando na sua conta…" });
    try {
      const result = await request("/api/sheet", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Ficha-Request": "1", "X-Ficha-Account": snapshot.user.uid },
        body: JSON.stringify({ form: snapshot.form, revision: snapshot.revision }),
      });
      if (!mounted.current || version !== generation.current) return;
      const dirty = current.current.form !== snapshot.form;
      patch({ revision: result.revision, saving: false, dirty, legacy: null,
        status: dirty ? "Alterações pendentes…" : "Salvo na sua conta." });
    } catch (error) {
      if (!mounted.current || version !== generation.current) return;
      if (error.code === "ACCOUNT_CHANGED") return load();
      if (["LOGIN_REQUIRED", "ACCESS_DENIED"].includes(error.code)) {
        patch({ ready: false, user: null, form: {}, dirty: false, legacy: null });
      }
      patch({ saving: false, failure: error.code, status: error.message });
    }
  }, [patch, load]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; generation.current++; };
  }, [load]);

  useEffect(() => {
    if (!state.ready || !state.dirty || state.saving || state.failure) return;
    const timer = setTimeout(save, 800);
    return () => clearTimeout(timer);
  }, [state.form, state.ready, state.dirty, state.saving, state.failure, save]);

  useEffect(() => {
    let checking = false;
    const verifyAccount = async () => {
      if (checking || !current.current.ready || document.visibilityState === "hidden") return;
      checking = true;
      const version = generation.current;
      try {
        const { user } = await request("/api/session");
        if (mounted.current && version === generation.current && user.uid !== current.current.user?.uid) await load();
      } catch (error) {
        if (mounted.current && version === generation.current && ["LOGIN_REQUIRED", "ACCESS_DENIED"].includes(error.code)) {
          generation.current++;
          patch({ ready: false, user: null, form: {}, dirty: false, saving: false, legacy: null, failure: error.code, status: error.message });
        }
      } finally { checking = false; }
    };
    const timer = setInterval(verifyAccount, 60000);
    window.addEventListener("focus", verifyAccount);
    document.addEventListener("visibilitychange", verifyAccount);
    const beforeUnload = event => {
      if (!current.current.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", verifyAccount);
      document.removeEventListener("visibilitychange", verifyAccount);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [load, patch]);

  const onChange = useCallback((name, value) => {
    const snapshot = current.current;
    if (!snapshot.ready) return;
    patch({ form: { ...snapshot.form, [name]: value }, dirty: true,
      failure: snapshot.failure === "SHEET_CONFLICT" ? snapshot.failure : "",
      status: snapshot.failure === "SHEET_CONFLICT" ? snapshot.status : "Alterações pendentes…" });
  }, [patch]);

  const clear = () => {
    if (window.confirm("Limpar todos os campos da ficha da sua conta?")) {
      patch({ form: {}, dirty: true, legacy: null, status: "Alterações pendentes…" });
    }
  };
  const reload = () => {
    if (!current.current.saving && (!current.current.dirty || window.confirm("Recarregar a ficha do banco e descartar as alterações ainda não salvas?"))) load();
  };
  const importLegacy = () => {
    const snapshot = current.current;
    if (snapshot.user?.username === "pyu" && snapshot.legacy && snapshot.revision === 0) {
      patch({ form: snapshot.legacy, legacy: null, dirty: true, status: "Importando a ficha para sua conta…" });
    }
  };
  const startEmpty = () => patch({ legacy: null, form: {}, dirty: true, status: "Salvando ficha vazia…" });
  const logout = () => {
    if (!current.current.dirty || window.confirm("Sair com alterações ainda não salvas?")) {
      generation.current++;
      patch({ ready: false, form: {}, user: null, dirty: false });
      window.location.assign("/outpost.goauthentik.io/sign_out");
    }
  };
  return { ...state, onChange, save, clear, reload, importLegacy, startEmpty, logout };
}
