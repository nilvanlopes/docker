import React from "react";
import { IdentitySection } from "./IdentitySection";
import { GameLogo } from "./GameLogo";
import {
  AbilitiesPanel,
  AttacksPanel,
  CombatPanel,
  ConditionsPanel,
  FatiguePanel,
  SavesPanel,
} from "./PageOnePanels";
import { FeatsPanel } from "./FeatsPanel";
import { PowersPanel } from "./PowersPanel";

export function CharacterPage({ form, derived, onChange }) {
  return (
    <section className="sheet-page page-one" aria-labelledby="abilities-title">
      <GameLogo />
      <div className="page-one-content">
        <IdentitySection form={form} onChange={onChange} />

        <div className="page-one-middle">
          <div className="page-one-left">
            <AbilitiesPanel form={form} derived={derived} onChange={onChange} />
            <SavesPanel form={form} derived={derived} onChange={onChange} />
            <CombatPanel form={form} derived={derived} onChange={onChange} />
            <AttacksPanel form={form} onChange={onChange} />
            <ConditionsPanel form={form} onChange={onChange} />
            <FatiguePanel form={form} onChange={onChange} />
          </div>
          <PowersPanel form={form} onChange={onChange} />
        </div>

        <FeatsPanel form={form} onChange={onChange} />
      </div>
      <div className="page-footer">©2005 Green Ronin Publishing LLC. Todos os direitos reservados. É permitido reproduzir esta página para uso pessoal.</div>
    </section>
  );
}
