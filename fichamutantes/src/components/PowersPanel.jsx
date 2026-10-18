import React from "react";
import { powers } from "../data";
import { TextField } from "./FormField";

function PowerInput({ name, label, form, onChange }) {
  return (
    <input
      data-field={name}
      aria-label={label}
      value={form[name] ?? ""}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

function PowerNotes({ number, form, onChange }) {
  return (
    <div className="power-notes">
      <div className="power-guides" aria-hidden="true">
        <span /><span /><span />
      </div>
      <TextField
        name={"poder-" + number + "-descricao"}
        label={"Poder " + number + " descrição"}
        value={form["poder-" + number + "-descricao"]}
        onChange={onChange}
        className="power-description"
      />
    </div>
  );
}

export function PowersPanel({ form, onChange }) {
  return (
    <section className="panel powers-panel" aria-labelledby="powers-title">
      <h2 className="section-title" id="powers-title">Poderes/Dispositivos</h2>
      <div className="power-head">
        <span>Nome</span>
        <span>Graduação</span>
        <span>Ação</span>
        <span>Alcance</span>
        <span>Duração</span>
      </div>
      <div className="power-list">
        {powers.map((number) => (
          <div className="power-card" key={number}>
            <div className="power-fields">
              <label>
                <PowerInput
                  name={"poder-" + number + "-nome"}
                  label={"Poder " + number + " nome"}
                  form={form}
                  onChange={onChange}
                />
              </label>
              <PowerInput name={"poder-" + number + "-graduacao"} label={"Poder " + number + " graduação"} form={form} onChange={onChange} />
              <PowerInput name={"poder-" + number + "-acao"} label={"Poder " + number + " ação"} form={form} onChange={onChange} />
              <PowerInput name={"poder-" + number + "-alcance"} label={"Poder " + number + " alcance"} form={form} onChange={onChange} />
              <PowerInput name={"poder-" + number + "-duracao"} label={"Poder " + number + " duração"} form={form} onChange={onChange} />
            </div>
            <PowerNotes number={number} form={form} onChange={onChange} />
          </div>
        ))}
      </div>
    </section>
  );
}
