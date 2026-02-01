/**
 * ICD-10-GM Version 2024 – chapter overview (Kapitelübersicht).
 * Source: BfArM – https://klassifikationen.bfarm.de/icd-10-gm/kode-suche/htmlgm2024/index.htm
 * Used by the chat to explain diagnosis codes from doctor's notes.
 */

export const ICD10GM_CHAPTERS: { range: string; title: string }[] = [
  { range: "A00-B99", title: "Bestimmte infektiöse und parasitäre Krankheiten" },
  { range: "C00-D48", title: "Neubildungen" },
  { range: "D50-D90", title: "Krankheiten des Blutes und der blutbildenden Organe sowie bestimmte Störungen mit Beteiligung des Immunsystems" },
  { range: "E00-E90", title: "Endokrine, Ernährungs- und Stoffwechselkrankheiten" },
  { range: "F00-F99", title: "Psychische und Verhaltensstörungen" },
  { range: "G00-G99", title: "Krankheiten des Nervensystems" },
  { range: "H00-H59", title: "Krankheiten des Auges und der Augenanhangsgebilde" },
  { range: "H60-H95", title: "Krankheiten des Ohres und des Warzenfortsatzes" },
  { range: "I00-I99", title: "Krankheiten des Kreislaufsystems" },
  { range: "J00-J99", title: "Krankheiten des Atmungssystems" },
  { range: "K00-K93", title: "Krankheiten des Verdauungssystems" },
  { range: "L00-L99", title: "Krankheiten der Haut und der Unterhaut" },
  { range: "M00-M99", title: "Krankheiten des Muskel-Skelett-Systems und des Bindegewebes" },
  { range: "N00-N99", title: "Krankheiten des Urogenitalsystems" },
  { range: "O00-O99", title: "Schwangerschaft, Geburt und Wochenbett" },
  { range: "P00-P96", title: "Bestimmte Zustände, die ihren Ursprung in der Perinatalperiode haben" },
  { range: "Q00-Q99", title: "Angeborene Fehlbildungen, Deformitäten und Chromosomenanomalien" },
  { range: "R00-R99", title: "Symptome und abnorme klinische und Laborbefunde, die anderenorts nicht klassifiziert sind" },
  { range: "S00-T98", title: "Verletzungen, Vergiftungen und bestimmte andere Folgen äußerer Ursachen" },
  { range: "V01-Y84", title: "Äußere Ursachen von Morbidität und Mortalität" },
  { range: "Z00-Z99", title: "Faktoren, die den Gesundheitszustand beeinflussen und zur Inanspruchnahme des Gesundheitswesens führen" },
  { range: "U00-U99", title: "Schlüsselnummern für besondere Zwecke" },
]

/** Common ICD-10-GM codes often seen on German doctor's notes (subset for context). */
export const ICD10GM_COMMON: { code: string; title: string }[] = [
  { code: "E11", title: "Diabetes mellitus, Typ 2" },
  { code: "I10", title: "Essentielle (primäre) Hypertonie" },
  { code: "G43", title: "Migräne" },
  { code: "J06", title: "Akute Infektionen an mehreren oder nicht näher bezeichneten Lokalisationen der oberen Atemwege" },
  { code: "M54", title: "Kreuzschmerz und sonstige Rückenschmerzen" },
  { code: "F32", title: "Depressive Episode" },
  { code: "J45", title: "Asthma bronchiale" },
  { code: "K21", title: "Gastroösophageale Refluxkrankheit" },
  { code: "M25", title: "Sonstige Gelenkkrankheiten" },
  { code: "R51", title: "Kopfschmerz" },
]

export function getIcd10GmReference(): string {
  const chapters = ICD10GM_CHAPTERS.map((c) => `${c.range}: ${c.title}`).join("\n")
  const common = ICD10GM_COMMON.map((c) => `${c.code}: ${c.title}`).join("\n")
  return `ICD-10-GM 2024 (German modification). Full reference: https://klassifikationen.bfarm.de/icd-10-gm/kode-suche/htmlgm2024/index.htm

Chapters (Kapitel):
${chapters}

Common codes (examples):
${common}

When the user asks about an ICD-10 or ICD-10-GM code (e.g. G43.0, E11.9), use this list to say which chapter/category it belongs to and give a short plain-language explanation. For codes not in the list, infer from the chapter range (e.g. G43 is in G00-G99 Nervensystem).`
}
