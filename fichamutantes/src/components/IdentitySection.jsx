import React from "react";
import { CheckField, LineField } from "./FormField";

function IdentityLabel({ children, name, label, form, onChange }) {
  return (
    <label className="identity-label">
      {children}
      <LineField
        name={name}
        label={label}
        value={form[name]}
        onChange={onChange}
      />
    </label>
  );
}

export function IdentitySection({ form, onChange }) {
  return (
    <section className="identity" aria-label="Identidade do personagem">
      <div className="identity-row two">
        <IdentityLabel
          name="nome-personagem"
          label="Nome do personagem"
          form={form}
          onChange={onChange}
        >
          Nome do Personagem{" "}
        </IdentityLabel>
        <IdentityLabel name="grupo" label="Grupo" form={form} onChange={onChange}>
          Grupo{" "}
        </IdentityLabel>
      </div>

      <div className="identity-row two">
        <IdentityLabel
          name="identidade-civil"
          label="Identidade civil"
          form={form}
          onChange={onChange}
        >
          Identidade Civil{" "}
        </IdentityLabel>
        <div className="identity-checks">
          <span>Identidade</span>
          <label className="check-label">
            <CheckField
              name="identidade-secreta"
              label="Identidade secreta"
              value={form["identidade-secreta"]}
              onChange={onChange}
            />
            Secreta
          </label>
          <label className="check-label">
            <CheckField
              name="identidade-publica"
              label="Identidade pública"
              value={form["identidade-publica"]}
              onChange={onChange}
            />
            Pública
          </label>
        </div>
      </div>

      <div className="identity-row two">
        <IdentityLabel
          name="base-operacoes"
          label="Base de operações"
          form={form}
          onChange={onChange}
        >
          Base de Operações{" "}
        </IdentityLabel>
        <IdentityLabel
          name="primeira-aparicao"
          label="Primeira aparição"
          form={form}
          onChange={onChange}
        >
          Primeira Aparição{" "}
        </IdentityLabel>
      </div>

      <div className="identity-row five">
        <IdentityLabel
          name="nivel-poder"
          label="Nível de poder"
          form={form}
          onChange={onChange}
        >
          Nível de Poder{" "}
        </IdentityLabel>
        <IdentityLabel
          name="pontos-poder-p2"
          label="Pontos de poder"
          form={form}
          onChange={onChange}
        >
          Pontos de Poder{" "}
        </IdentityLabel>
        <IdentityLabel name="tamanho" label="Tamanho" form={form} onChange={onChange}>
          Tamanho{" "}
        </IdentityLabel>
        <IdentityLabel name="altura" label="Altura" form={form} onChange={onChange}>
          Altura{" "}
        </IdentityLabel>
        <IdentityLabel name="peso" label="Peso" form={form} onChange={onChange}>
          Peso{" "}
        </IdentityLabel>
      </div>

      <div className="identity-row appearance-row">
        <IdentityLabel name="genero" label="Gênero" form={form} onChange={onChange}>
          Gênero{" "}
        </IdentityLabel>
        <IdentityLabel name="idade" label="Idade" form={form} onChange={onChange}>
          Idade{" "}
        </IdentityLabel>
        <IdentityLabel name="olhos" label="Olhos" form={form} onChange={onChange}>
          Olhos{" "}
        </IdentityLabel>
        <IdentityLabel name="cabelo" label="Cabelo" form={form} onChange={onChange}>
          Cabelo{" "}
        </IdentityLabel>
        <span aria-hidden="true" />
      </div>
    </section>
  );
}
