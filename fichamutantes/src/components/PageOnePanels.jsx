import React from "react";
import { conditionGroups, fatigueGroups, saveRows } from "../data";
import { BoxField, CheckField } from "./FormField";

export function AbilitiesPanel({ form, derived, onChange }) {
  return (
    <section className="panel ability-panel" aria-labelledby="abilities-title">
      <h1 className="section-title" id="abilities-title">Habilidades</h1>
      <div className="ability-head table-head">
        <span />
        <span>Modificador</span>
        <span>Valor<br />total</span>
        <span />
        <span>Valor<br />base</span>
        <span />
        <span>Valor<br />aumentado</span>
      </div>
      <div className="ability-rows">
        {derived.abilitiesList.map(({ key, label }) => (
          <div className="ability-row" key={key}>
            <strong className="ability-name">{label}</strong>
            <BoxField
              name={key + "-mod"}
              label={"Modificador " + label}
              value={derived.abilities[key].mod}
              onChange={onChange}
              readOnly
            />
            <BoxField
              name={key + "-total"}
              label={"Valor total " + label}
              value={derived.abilities[key].total}
              onChange={onChange}
              readOnly
            />
            <span className="operator">=</span>
            <BoxField
              name={key + "-base"}
              label={"Valor base " + label}
              value={form[key + "-base"]}
              onChange={onChange}
            />
            <span className="operator">+</span>
            <BoxField
              name={key + "-aumentado"}
              label={"Valor aumentado " + label}
              value={form[key + "-aumentado"]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SavesPanel({ form, derived, onChange }) {
  return (
    <section className="panel save-panel" aria-labelledby="saves-title">
      <h2 className="section-title" id="saves-title">Jogadas de Salvamento</h2>
      <div className="save-head">
        <span />
        <span>Total</span>
        <span>Bônus<br />base</span>
        <span>Modificador<br />de habilidade</span>
        <span>Outros</span>
      </div>
      <div className="save-rows">
        {saveRows.map(({ key, label, ability }) => (
          <div className="save-row" key={key}>
            <strong className="save-name">{label}</strong>
            <BoxField
              name={key + "-total"}
              label={label + " total"}
              value={derived.saves[key]}
              onChange={onChange}
              readOnly
            />
            <BoxField
              name={key + "-base"}
              label={label + " bônus base"}
              value={form[key + "-base"]}
              onChange={onChange}
            />
            <span className="box-input operator">{ability.toUpperCase()}</span>
            <BoxField
              name={key + "-outros"}
              label={label + " outros"}
              value={form[key + "-outros"]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CombatPanel({ form, derived, onChange }) {
  return (
    <section className="panel combat-panel" aria-labelledby="combat-title">
      <h2 className="section-title" id="combat-title">Combate</h2>
      <div>
        <div className="combat-head">
          <span />
          <span>Total</span>
          <span />
          <span>Bônus<br />base</span>
          <span>Outros</span>
          <span>Desprevenido</span>
        </div>
        <div className="combat-rows">
          <div className="combat-row">
            <strong className="combat-name">Defesa</strong>
            <BoxField
              name="defesa-total"
              label="Defesa total"
              value={derived.defense}
              onChange={onChange}
              readOnly
            />
            <span className="operator">= 10 +</span>
            <BoxField name="defesa-base" label="Defesa bônus base" value={form["defesa-base"]} onChange={onChange} />
            <BoxField name="defesa-outros" label="Defesa outros" value={form["defesa-outros"]} onChange={onChange} />
            <BoxField name="defesa-desprevenido" label="Defesa desprevenido" value={form["defesa-desprevenido"]} onChange={onChange} />
          </div>
          <div className="combat-row">
            <strong className="combat-name">Iniciativa</strong>
            <BoxField
              name="iniciativa-total"
              label="Iniciativa total"
              value={derived.initiative}
              onChange={onChange}
              readOnly
            />
            <span className="operator">=</span>
            <BoxField name="iniciativa-dex" label="Iniciativa modificador de destreza" value={form["iniciativa-dex"]} onChange={onChange} />
            <BoxField name="iniciativa-feito" label="Iniciativa modificador de feito" value={form["iniciativa-feito"]} onChange={onChange} />
            <BoxField name="iniciativa-poder" label="Iniciativa modificador de poder" value={form["iniciativa-poder"]} onChange={onChange} />
          </div>
          <div className="hero-row">
            <strong className="combat-name">Pontos Heróicos</strong>
            <BoxField name="pontos-heroi" label="Pontos heróicos" value={form["pontos-heroi"]} onChange={onChange} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AttacksPanel({ form, onChange }) {
  return (
    <section className="panel attack-panel" aria-labelledby="attacks-title">
      <h2 className="section-title" id="attacks-title">Ataques</h2>
      <div className="attack-row">
        <div className="attack-pair">
          <strong className="attack-label">Corpo-a-corpo</strong>
          <BoxField name="ataque-corpo-corpo" label="Ataque corpo a corpo" value={form["ataque-corpo-corpo"]} onChange={onChange} />
        </div>
        <div className="attack-pair">
          <strong className="attack-label">À distância</strong>
          <BoxField name="ataque-distancia" label="Ataque à distância" value={form["ataque-distancia"]} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}

export function ConditionsPanel({ form, onChange }) {
  return (
    <section className="panel condition-panel" aria-labelledby="condition-title">
      <h2 className="section-title" id="condition-title">Condições de Dano</h2>
      <div className="condition-grid">
        {conditionGroups.map((group) => (
          <div className="condition-item" key={group.label}>
            <span className="condition-name">{group.label}</span>
            <span className="condition-checks">
              {group.fields.map((field) => (
                <CheckField
                  key={field}
                  name={field}
                  label={group.label}
                  value={form[field]}
                  onChange={onChange}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FatiguePanel({ form, onChange }) {
  return (
    <section className="panel fatigue-panel" aria-labelledby="fatigue-title">
      <h2 className="section-title" id="fatigue-title">Condições de Fadiga</h2>
      <div className="fatigue-grid">
        {fatigueGroups.map(([label, field]) => (
          <label className="fatigue-item" key={field}>
            <span className="fatigue-name">{label}</span>
            <CheckField
              name={field}
              label={label}
              value={form[field]}
              onChange={onChange}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
