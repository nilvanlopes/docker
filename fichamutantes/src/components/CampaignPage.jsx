import React from "react";
import { skills } from "../data";
import { BoxField, LineField, MiniField, TextField } from "./FormField";

function CampaignInfo({ form, onChange }) {
  return (
    <section className="panel campaign-info" aria-labelledby="campaign-title">
      <h1 className="section-title" id="campaign-title">Informações sobre a campanha</h1>
      <div className="campaign-info-body">
        <div className="campaign-info-row">
          <label className="campaign-info-label">
            Campanha{" "}
            <LineField name="campanha" label="Campanha" value={form.campanha} onChange={onChange} />
          </label>
          <label className="campaign-info-label">
            Mestre{" "}
            <LineField name="mestre" label="Mestre" value={form.mestre} onChange={onChange} />
          </label>
          <label className="campaign-info-label">
            Pontos de poder{" "}
            <LineField name="pontos-poder" label="Pontos de poder" value={form["pontos-poder"]} onChange={onChange} />
          </label>
        </div>
        <div className="campaign-info-row">
          <label className="campaign-info-label">
            Heróis amigos{" "}
            <LineField name="herois-amigos" label="Heróis amigos" value={form["herois-amigos"]} onChange={onChange} />
          </label>
        </div>
        <div className="campaign-info-row">
          <label className="campaign-info-label">
            Parceiros ou capangas{" "}
            <LineField name="parceiros" label="Parceiros ou capangas" value={form.parceiros} onChange={onChange} />
          </label>
          <label className="campaign-info-label">
            Arqui-inimigo{" "}
            <LineField name="arqui-inimigo" label="Arqui-inimigo" value={form["arqui-inimigo"]} onChange={onChange} />
          </label>
        </div>
      </div>
    </section>
  );
}

function WritingPanel({ title, prefix, amount, form, onChange, className = "" }) {
  return (
    <section className={"panel writing-panel " + className} aria-label={title}>
      <h2 className="section-title">{title}</h2>
      <div className={"line-list " + prefix + "-lines"}>
        {Array.from({ length: amount }, (_, index) => {
          const number = index + 1;
          const name = prefix + "-" + number;
          return (
            <LineField
              key={name}
              name={name}
              label={title + " linha " + number}
              value={form[name]}
              onChange={onChange}
              className="line-entry"
            />
          );
        })}
      </div>
    </section>
  );
}

function SkillsPanel({ form, derived, onChange }) {
  return (
    <section className="panel skills-panel" aria-labelledby="skills-title">
      <div className="skills-title">
        <h2 className="section-title" id="skills-title">Perícias</h2>
        <label className="max-ranks">
          Graduações<br />máximas
          <BoxField
            name="graduacoes-maximas"
            label="Graduações máximas"
            value={form["graduacoes-maximas"]}
            onChange={onChange}
          />
        </label>
      </div>
      <div className="skills-head">
        <span />
        <span>Bônus de<br />perícia</span>
        <span>=</span>
        <span>Grad. na<br />perícia</span>
        <span>+</span>
        <span>Mod. de<br />habilidade</span>
        <span>+</span>
        <span>Outros</span>
      </div>
      <div className="skills-list">
        {skills.map(([label, ability], index) => {
          const number = index + 1;
          return (
            <div className="skill-row" key={number}>
              <span className="skill-name">{label}</span>
              <MiniField name={"skill-" + number + "-bonus"} label={"Bônus " + label} value={derived.skillBonuses[index]} onChange={onChange} readOnly />
              <span className="operator">=</span>
              <MiniField name={"skill-" + number + "-rank"} label={"Graduação " + label} value={form["skill-" + number + "-rank"]} onChange={onChange} />
              <span className="operator">+</span>
              <span className="skill-ability">{ability}</span>
              <span className="operator">+</span>
              <MiniField name={"skill-" + number + "-other"} label={"Outros " + label} value={form["skill-" + number + "-other"]} onChange={onChange} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CampaignPage({ form, derived, onChange }) {
  return (
    <section className="sheet-page page-two" aria-labelledby="campaign-title">
      <div className="campaign-layout">
        <div className="campaign-left">
          <CampaignInfo form={form} onChange={onChange} />
          <WritingPanel title="Equipamento" prefix="equipment" amount={16} form={form} onChange={onChange} />
          <WritingPanel title="Origem" prefix="origin" amount={13} form={form} onChange={onChange} />
          <WritingPanel title="Desvantagens & Complicações" prefix="disadvantage" amount={8} form={form} onChange={onChange} />
        </div>
        <div className="campaign-right">
          <SkillsPanel form={form} derived={derived} onChange={onChange} />
          <section className="panel drawing-panel" aria-labelledby="drawing-title">
            <h2 className="section-title" id="drawing-title">Desenho do personagem</h2>
            <TextField
              name="desenho"
              label="Desenho do personagem"
              value={form.desenho}
              onChange={onChange}
              className="drawing-space"
            />
          </section>
        </div>
      </div>
      <div className="page-footer">©2005 Green Ronin Publishing LLC. Todos os direitos reservados. É permitido reproduzir esta página para uso pessoal.</div>
    </section>
  );
}
