import React, { useMemo, useRef, useState } from "react";
import { featCatalog } from "../featsCatalog";
import { LineField } from "./FormField";

const featRows = Array.from({ length: 16 }, (_, index) => {
  const number = index + 1;

  return {
    number,
    slots: [
      {
        id: `${number}a`,
        nameField: `feito-${number}-nome`,
        benefitField: `feito-${number}-beneficio`,
        rankField: `feito-${number}-graduacao`,
        label: `Feito ${number}`,
      },
      {
        id: `${number}b`,
        nameField: `feito-${number}b-nome`,
        benefitField: `feito-${number}b-beneficio`,
        rankField: `feito-${number}b-graduacao`,
        label: `Feito ${number} coluna direita`,
      },
    ],
  };
});

const compareFeatNames = (left, right) => left.localeCompare(right, "pt-BR", { sensitivity: "base" });

export function FeatsPanel({ form, onChange }) {
  const dialogRef = useRef(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [query, setQuery] = useState("");
  const [catalogView, setCatalogView] = useState("owned");
  const [selectedFeat, setSelectedFeat] = useState(null);
  const [selectedOwnedSlot, setSelectedOwnedSlot] = useState(null);

  const normalizeName = (name) => String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");

  const ownedFeats = useMemo(
    () => {
      const seen = new Set();
      return featRows.flatMap(({ slots }) => slots
        .filter((slot) => {
          const key = normalizeName(form[slot.nameField]);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((slot) => ({
          slot,
          name: form[slot.nameField].trim(),
          feat: featCatalog.find((feat) => normalizeName(feat.name) === normalizeName(form[slot.nameField])),
          ranks: form[slot.rankField] || "1",
        })))
        .sort((left, right) => compareFeatNames(left.name, right.name));
    },
    [form],
  );

  const sheetFeatSlots = useMemo(() => {
    const sortedSlots = featRows.flatMap(({ slots }) => slots)
      .sort((left, right) => {
        const leftName = String(form[left.nameField] || "").trim();
        const rightName = String(form[right.nameField] || "").trim();
        if (!leftName) return rightName ? 1 : 0;
        if (!rightName) return -1;
        return compareFeatNames(leftName, rightName);
      });

    return sortedSlots;
  }, [form]);

  const filteredFeats = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return featCatalog.filter((feat) =>
      !ownedFeats.some((owned) => normalizeName(owned.name) === normalizeName(feat.name)) &&
      (!normalizedQuery || `${feat.name} ${feat.category} ${feat.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery)),
    ).sort((left, right) => compareFeatNames(left.name, right.name));
  }, [query, ownedFeats]);

  const openCatalog = (slot) => {
    setActiveSlot(slot);
    setQuery("");
    setSelectedFeat(null);
    setSelectedOwnedSlot(null);
    setCatalogView("catalog");
    dialogRef.current?.showModal();
  };

  const openCatalogFromPanel = (event) => {
    if (event.target.closest("input, button, textarea, select, [contenteditable='true']")) return;
    setCatalogView("owned");
    setQuery("");
    setSelectedFeat(null);
    setSelectedOwnedSlot(null);
    dialogRef.current?.showModal();
  };

  const closeCatalog = () => {
    dialogRef.current?.close();
    setActiveSlot(null);
    setSelectedFeat(null);
    setSelectedOwnedSlot(null);
  };

  const removeFeat = (slot) => {
    onChange(slot.nameField, "");
    onChange(slot.benefitField, "");
    onChange(slot.rankField, "");
    setSelectedOwnedSlot(null);
  };

  const chooseFeat = (feat) => {
    const slot = activeSlot || featRows.flatMap(({ slots }) => slots)
      .find(({ nameField }) => !form[nameField]?.trim() || normalizeName(form[nameField]) === normalizeName(feat.name));
    if (!slot) return;
    onChange(slot.nameField, feat.name);
    onChange(slot.benefitField, feat.benefit);
    onChange(slot.rankField, "1");
    closeCatalog();
  };

  return (
    <>
      <section
        className="panel feats-panel"
        aria-labelledby="feats-title"
        onClick={openCatalogFromPanel}
      >
        <h2 className="section-title" id="feats-title">Feitos</h2>
        <div className="feat-head">
          <span>Nome</span>
          <span>Benefício</span>
        </div>
        <div className="feat-rows">
          {sheetFeatSlots.map((slot) => (
            <div className="feat-row" key={slot.id}>
              <button
                className={`feat-picker-trigger${form[slot.nameField] ? " has-feat" : ""}`}
                type="button"
                data-field={slot.nameField}
                aria-label={`${slot.label}: ${form[slot.nameField] || "abrir catálogo de feitos"}`}
                aria-haspopup="dialog"
                onClick={() => openCatalog(slot)}
              >
                {form[slot.nameField] || <span className="feat-placeholder">Escolher feito</span>}
              </button>
              <LineField
                name={slot.benefitField}
                label={`${slot.label} benefício`}
                value={form[slot.benefitField]}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      </section>

      <dialog
        className="feat-catalog-dialog"
        ref={dialogRef}
        aria-labelledby="feat-catalog-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeCatalog();
        }}
        onClose={() => setActiveSlot(null)}
      >
        <div className="feat-catalog-header">
          <div className="feat-catalog-title-group">
            <div>
              <p className="feat-catalog-eyebrow">Mutantes &amp; Malfeitores</p>
              <h2 id="feat-catalog-title">{catalogView === "owned" ? "Feitos" : "Adicionar feito"}</h2>
            </div>
            {catalogView === "owned" && (
              <button
                className="feat-catalog-add"
                type="button"
                aria-label="Adicionar feito"
                title="Adicionar feito"
                onClick={() => {
                  setCatalogView("catalog");
                  setActiveSlot(null);
                  setSelectedFeat(null);
                  setSelectedOwnedSlot(null);
                  setQuery("");
                }}
              >
                +
              </button>
            )}
          </div>
          <button
            className="feat-catalog-close"
            type="button"
            aria-label="Fechar catálogo"
            onClick={closeCatalog}
          >
            ×
          </button>
        </div>

        {catalogView === "catalog" && <div className="feat-catalog-tools">
          <label htmlFor="feat-catalog-search">Buscar por nome, categoria ou descrição</label>
          <input
            autoFocus
            id="feat-catalog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: agarrar, defesa, sorte…"
          />
        </div>}

        <div className="feat-catalog-list">
          {catalogView === "owned" ? (
            ownedFeats.length ? ownedFeats.map(({ name, feat, slot, ranks }) => (
              <article
                className={`feat-book-entry feat-book-entry--selectable${selectedOwnedSlot === slot.id ? " is-selected" : ""}`}
                key={slot.id}
                onClick={() => setSelectedOwnedSlot(selectedOwnedSlot === slot.id ? null : slot.id)}
              >
                <button
                  className="feat-book-title"
                  type="button"
                  aria-expanded={selectedOwnedSlot === slot.id}
                  aria-label={`Opções para remover ${name}`}
                  onClick={() => setSelectedOwnedSlot(selectedOwnedSlot === slot.id ? null : slot.id)}
                >
                  <span>{name}</span>
                  {feat && <span className="feat-book-meta">{feat.category} · {ranks} {ranks === "1" ? "graduação" : "graduações"}</span>}
                </button>
                <p>{feat?.description || form[slot.benefitField] || "Descrição não cadastrada."}</p>
                {selectedOwnedSlot === slot.id && (
                  <div className="feat-add-tray">
                    {feat?.page && <span className="feat-page-label">Livro básico · p. {feat.page}</span>}
                    <button className="feat-add-confirm" type="button" onClick={() => removeFeat(slot)}>
                      Remover feito
                    </button>
                  </div>
                )}
              </article>
            )) : <p className="feat-catalog-empty">O Cavaleiro ainda não tem feitos cadastrados.</p>
          ) : filteredFeats.length ? (
            filteredFeats.map((feat) => (
              <article
                className={`feat-book-entry feat-book-entry--selectable${selectedFeat === feat.name ? " is-selected" : ""}`}
                key={feat.name}
                onClick={() => setSelectedFeat(selectedFeat === feat.name ? null : feat.name)}
              >
                <button
                  className="feat-book-title"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedFeat(selectedFeat === feat.name ? null : feat.name);
                  }}
                  aria-expanded={selectedFeat === feat.name}
                  aria-label={`Ver opções para ${feat.name}`}
                >
                  <span>{feat.name}</span>
                  <span className="feat-book-meta">
                    {feat.category} · {feat.ranks} {feat.ranks === 1 ? "graduação" : "graduações"}
                  </span>
                </button>
                <p>{feat.description}</p>
                {selectedFeat === feat.name && (
                  <div className="feat-add-tray">
                    <span className="feat-page-label">Livro básico · p. {feat.page}</span>
                    <button
                      className="feat-add-confirm"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        chooseFeat(feat);
                      }}
                    >
                      {activeSlot ? "Substituir feito" : "Adicionar à ficha"}
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="feat-catalog-empty">
              {query.trim()
                ? "Nenhum feito disponível corresponde à busca."
                : "Todos os feitos deste catálogo já estão na ficha."}
            </p>
          )}
        </div>

      </dialog>
    </>
  );
}
