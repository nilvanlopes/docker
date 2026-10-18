import React, { useEffect, useRef, useState } from "react";

const icons = {
  save: "M5 4h12l3 3v13H4V4h1Zm2 0v6h10V4M7 20v-7h10v7",
  print: "M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6H7zM18 11h.01",
  clear: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 3v7m4-7v7",
  reload: "M20 7v5h-5M4 17v-5h5m-4-2a7 7 0 0 1 12-4l3 3M4 14l3 3a7 7 0 0 0 12-4",
  logout: "M10 4H5v16h5m4-4 4-4-4-4m4 4H9",
  menu: "M4 6h16M4 12h16M4 18h16",
};

function Icon({ name }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[name]} /></svg>;
}

export function Toolbar({ onSave, onPrint, onClear, onReload, onLogout, user, disabled, saving, conflict }) {
  const [open, setOpen] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    function start(event) {
      const touch = event.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
    function end(event) {
      if (!touchStart.current) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (open && dx < 0) setOpen(false);
        if (!open && touchStart.current.x < 32 && dx > 0) setOpen(true);
      }
      touchStart.current = null;
    }
    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchend", end, { passive: true });
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchend", end);
    };
  }, [open]);

  return (
    <>
      <button
        className="toolbar-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="sheet-actions"
        aria-label={open ? "Fechar menu de ações" : "Abrir menu de ações"}
        onClick={() => setOpen(!open)}
      >
        <Icon name="menu" /><span>Ações</span>
      </button>
      {open && <button className="toolbar-backdrop" type="button" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <nav id="sheet-actions" className={`toolbar${open ? " is-open" : ""}`} aria-label="Ações da ficha">
        <button className="toolbar-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar menu">×</button>
        <button className="primary" type="button" onClick={onSave} disabled={disabled || saving || conflict}>
          <Icon name="save" /><span>{saving ? "Salvando…" : "Salvar"}</span>
        </button>
        <button type="button" onClick={onPrint} disabled={disabled}><Icon name="print" /><span>Imprimir</span></button>
        <button type="button" onClick={onClear} disabled={disabled || saving}><Icon name="clear" /><span>Limpar</span></button>
        <button type="button" onClick={onReload} disabled={saving}><Icon name="reload" /><span>Recarregar</span></button>
        {user && <button type="button" onClick={onLogout}><Icon name="logout" /><span>Sair</span></button>}
        {user && <span className="account-label"><span>Conectado como</span> <strong>{user.username}</strong></span>}
      </nav>
    </>
  );
}
