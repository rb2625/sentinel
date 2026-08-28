export type Locale = "en" | "ar";

const translations: Record<string, Record<Locale, string>> = {
  // Navigation
  "nav.overview": { en: "Overview", ar: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629" },
  "nav.validate": { en: "Validate", ar: "\u062a\u062d\u0642\u0642" },
  "nav.incidents": { en: "Incidents", ar: "\u062d\u0648\u0627\u062f\u062b" },
  "nav.alerts": { en: "Alerts", ar: "\u062a\u0646\u0628\u064a\u0647\u0627\u062a" },
  "nav.map": { en: "Map", ar: "\u062e\u0631\u064a\u0637\u0629" },
  "nav.analytics": { en: "Analytics", ar: "\u062a\u062d\u0644\u064a\u0644\u0627\u062a" },

  // Overview
  "overview.title": { en: "Command Center", ar: "\u0645\u0631\u0643\u0632 \u0627\u0644\u062a\u062d\u0643\u0645" },
  "overview.total_incidents": { en: "Total Incidents", ar: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u062d\u0648\u0627\u062f\u062b" },
  "overview.active_alerts": { en: "Active Alerts", ar: "\u0627\u0644\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629" },
  "overview.avg_trust": { en: "Avg Trust Score", ar: "\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u062b\u0642\u0629" },

  // Validate
  "validate.title": { en: "Submit Incident Report", ar: "\u062a\u0642\u062f\u064a\u0645 \u062a\u0642\u0631\u064a\u0631 \u062d\u0627\u062f\u062b" },
  "validate.phone": { en: "Reporter Phone", ar: "\u0647\u0627\u062a\u0641 \u0627\u0644\u0645\u0628\u0644\u063a" },
  "validate.description": { en: "Description", ar: "\u0627\u0644\u0648\u0635\u0641" },
  "validate.submit": { en: "Submit and Validate", ar: "\u062a\u0642\u062f\u064a\u0645 \u0648\u062a\u062d\u0642\u0642" },
  "validate.location": { en: "Location Name", ar: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639" },
  "validate.language": { en: "Language", ar: "\u0627\u0644\u0644\u063a\u0629" },

  // Results
  "result.trust_score": { en: "Trust Score", ar: "\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u062b\u0642\u0629" },
  "result.validation": { en: "Validation Results", ar: "\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u062a\u062d\u0642\u0642" },
  "result.classification": { en: "Classification", ar: "\u0627\u0644\u062a\u0635\u0646\u064a\u0641" },
  "result.device_status": { en: "Device Status", ar: "\u062d\u0627\u0644\u0629 \u0627\u0644\u062c\u0647\u0627\u0632" },
  "result.location_verified": { en: "Location Verified", ar: "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639" },
  "result.sim_check": { en: "SIM Check", ar: "\u0641\u062d\u0635 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644" },

  // Severity
  "severity.critical": { en: "CRITICAL", ar: "\u062d\u0631\u062c" },
  "severity.high": { en: "HIGH", ar: "\u0639\u0627\u0644\u064a" },
  "severity.medium": { en: "MEDIUM", ar: "\u0645\u062a\u0648\u0633\u0637" },
  "severity.low": { en: "LOW", ar: "\u0645\u0646\u062e\u0641\u0636" },

  // Common
  "common.loading": { en: "Loading...", ar: "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644..." },
  "common.no_data": { en: "No data yet", ar: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a" },
  "common.back": { en: "Back", ar: "\u0631\u062c\u0648\u0639" },
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[key]?.[locale] || translations[key]?.en || key;
}
