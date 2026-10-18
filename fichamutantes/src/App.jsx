import React, { useMemo } from "react";
import { abilities, skills } from "./data";
import { CampaignPage } from "./components/CampaignPage";
import { CharacterPage } from "./components/CharacterPage";
import { Toolbar } from "./components/Toolbar";
import { useAccountSheet } from "./useAccountSheet";

function numeric(form, name) {
  return Number(form[name] || 0);
}

function filled(form, name) {
  return (form[name] ?? "") !== "";
}

function useCalculatedValues(form) {
  return useMemo(() => {
    const calculatedAbilities = {};

    abilities.forEach(({ key }) => {
      const hasValue = filled(form, key + "-base") || filled(form, key + "-aumentado");
      if (!hasValue) {
        calculatedAbilities[key] = { total: "", mod: "" };
        return;
      }
      const total = numeric(form, key + "-base") + numeric(form, key + "-aumentado");
      const modifier = Math.floor((total - 10) / 2);
      calculatedAbilities[key] = {
        total,
        mod: (modifier >= 0 ? "+" : "") + modifier,
      };
    });

    const saves = {};
    [
      ["resistencia", "con"],
      ["fortitude", "con"],
      ["reflexo", "des"],
      ["vontade", "sab"],
    ].forEach(([name, ability]) => {
      const hasValue =
        filled(form, name + "-base") ||
        filled(form, ability + "-base") ||
        filled(form, ability + "-aumentado") ||
        filled(form, name + "-outros");
      saves[name] = hasValue
        ? numeric(form, name + "-base") +
          Number(calculatedAbilities[ability].mod || 0) +
          numeric(form, name + "-outros")
        : "";
    });

    const defenseHasValue = ["base", "outros", "desprevenido"].some(
      (part) => filled(form, "defesa-" + part),
    );
    const initiativeHasValue = ["dex", "feito", "poder"].some(
      (part) => filled(form, "iniciativa-" + part),
    );

    const skillBonuses = skills.map(([, ability], index) => {
      const number = index + 1;
      const rankName = "skill-" + number + "-rank";
      const otherName = "skill-" + number + "-other";
      const hasValue = filled(form, rankName) || filled(form, otherName);
      if (!hasValue) return "";
      const abilityKey = { FOR: "for", DES: "des", CON: "con", INT: "int", SAB: "sab", CAR: "car" }[ability];
      const abilityModifier = abilityKey ? Number(calculatedAbilities[abilityKey].mod || 0) : 0;
      return numeric(form, rankName) + numeric(form, otherName) + abilityModifier;
    });

    return {
      abilities: calculatedAbilities,
      abilitiesList: abilities,
      saves,
      defense: defenseHasValue
        ? 10 +
          numeric(form, "defesa-base") +
          numeric(form, "defesa-outros") -
          numeric(form, "defesa-desprevenido")
        : "",
      initiative: initiativeHasValue
        ? numeric(form, "iniciativa-dex") +
          numeric(form, "iniciativa-feito") +
          numeric(form, "iniciativa-poder")
        : "",
      skillBonuses,
    };
  }, [form]);
}

export default function App() {
  const sheet = useAccountSheet();
  const derived = useCalculatedValues(sheet.form);
  return (
    <>
      <Toolbar
        onSave={sheet.save}
        onPrint={() => window.print()}
        onClear={sheet.clear}
        onReload={sheet.reload}
        onLogout={sheet.logout}
        user={sheet.user}
        disabled={!sheet.ready || Boolean(sheet.legacy)}
        saving={sheet.saving}
        conflict={sheet.failure === "SHEET_CONFLICT"}
      />
      {!sheet.ready ? (
        <section className="account-notice" aria-live="polite">
          <h1>{sheet.loading ? "Carregando sua ficha…" : "Não foi possível abrir sua ficha"}</h1>
          <p>{sheet.status}</p>
          {!sheet.loading && (["LOGIN_REQUIRED", "ACCESS_DENIED"].includes(sheet.failure)
            ? <a href="/outpost.goauthentik.io/sign_out">Entrar com sua conta</a>
            : <button type="button" onClick={sheet.reload}>Tentar novamente</button>)}
        </section>
      ) : (
        <>
          {sheet.legacy && (
            <section className="account-notice" aria-label="Importar ficha anterior">
              <p>Há uma ficha antiga salva neste navegador{sheet.legacy["nome-personagem"] ? `: ${sheet.legacy["nome-personagem"]}` : ""}. Deseja importá-la para a conta <strong>{sheet.user.username}</strong>?</p>
              <button type="button" onClick={sheet.importLegacy}>Importar para minha conta</button>
              <button type="button" onClick={sheet.startEmpty}>Começar com ficha vazia</button>
            </section>
          )}
          <fieldset className="sheet-fields" disabled={Boolean(sheet.legacy) || sheet.failure === "SHEET_CONFLICT"}>
            <main className="sheets">
              <CharacterPage form={sheet.form} derived={derived} onChange={sheet.onChange} />
              <CampaignPage form={sheet.form} derived={derived} onChange={sheet.onChange} />
            </main>
          </fieldset>
        </>
      )}
    </>
  );
}
