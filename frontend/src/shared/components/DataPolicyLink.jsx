// Enlace a la política de tratamiento de datos personales (Ley 1581 de 2012) y estado de
// la autorización en solo lectura (BEM: data-consent). Debe coincidir con DATA_POLICY_URL
// del backend (user.service.js).
import { ExternalLink } from "lucide-react";

export const DATA_POLICY_URL =
  "https://normograma.sena.edu.co/compilacion/docs/acuerdo_sena_0013_2019.htm";
export const DATA_POLICY_NAME =
  "Política General de Seguridad de la Información y Protección de Datos Personales del SENA";

export default function DataPolicyLink({ href = DATA_POLICY_URL, children = DATA_POLICY_NAME, className = "" }) {
  return (
    <a
      href={href || DATA_POLICY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir la política de tratamiento de datos (se abre en una pestaña nueva)"
      className={`data-consent__link ${className}`}
    >
      {children}
      <ExternalLink className="data-consent__link-icon" aria-hidden="true" />
    </a>
  );
}

// DD/MM/AAAA en hora de Colombia (data_consent_at es TIMESTAMPTZ)
const formatConsentDate = (value) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Bogota",
  });

// Solo lectura en UserView y ProfilePage
export function DataConsentStatus({ consentAt, policyUrl }) {
  return (
    <div className="data-consent data-consent--readonly">
      {consentAt ? (
        <p className="data-consent__value">
          <span className="data-consent__label">Autorización de tratamiento de datos:</span>{" "}
          aceptada el {formatConsentDate(consentAt)}
        </p>
      ) : (
        <p className="data-consent__value data-consent__value--empty">Sin registro de autorización</p>
      )}
      <DataPolicyLink href={policyUrl}>Política de tratamiento de datos</DataPolicyLink>
    </div>
  );
}
