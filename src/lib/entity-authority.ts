export function buildEntityAuthority(site: string) {
  const volponi = "https://volponi.tech";
  const hub = `${volponi}/hub`;
  const instagram = "https://www.instagram.com/lorenzavolponi/";
  const github = "https://github.com/LorenzaVolponi";
  const linkedin = "https://www.linkedin.com/in/lorenzavolponi";

  return {
    ids: {
      product: `${site}/#organization`,
      website: `${site}/#website`,
      dictionary: `${site}/#dictionary`,
      aix8c: `${volponi}/#aix8c`,
      creator: `${volponi}/#lorenza-volponi`,
      hub: `${hub}#collection`,
      parent: `${volponi}/#website`,
    },
    graph: [
      {
        "@type": ["SoftwareApplication", "CreativeWork"],
        "@id": `${site}/#giria-ai`,
        name: "Gíria AI",
        url: site,
        description: "Sistema de linguagem, contexto e NLP aplicado ao português brasileiro e à cultura digital.",
        applicationCategory: "Artificial Intelligence",
        creator: { "@id": `${volponi}/#lorenza-volponi` },
        publisher: { "@id": `${volponi}/#aix8c` },
        isPartOf: { "@id": `${hub}#collection` },
        subjectOf: { "@id": `${site}/#website` },
        about: ["gírias brasileiras", "memes", "linguagem informal brasileira", "cultura digital", "NLP", "contexto semântico"],
      },
      {
        "@type": "Organization",
        "@id": `${volponi}/#aix8c`,
        name: "AIX8C",
        url: volponi,
        description: "Studio identity e ecossistema de sistemas de IA criado por Lorenza Volponi.",
        founder: { "@id": `${volponi}/#lorenza-volponi` },
        subjectOf: { "@id": `${hub}#collection` },
      },
      {
        "@type": "Person",
        "@id": `${volponi}/#lorenza-volponi`,
        name: "Lorenza Volponi",
        url: volponi,
        sameAs: [instagram, github, linkedin],
        affiliation: { "@id": `${volponi}/#aix8c` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${hub}#collection`,
        name: "AIX8C Hub",
        url: hub,
        creator: { "@id": `${volponi}/#lorenza-volponi` },
        hasPart: { "@id": `${site}/#giria-ai` },
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        name: "Gíria AI",
        url: site,
        inLanguage: "pt-BR",
        publisher: { "@id": `${volponi}/#aix8c` },
        creator: { "@id": `${volponi}/#lorenza-volponi` },
        about: { "@id": `${site}/#giria-ai` },
        isPartOf: { "@id": `${hub}#collection` },
      },
    ],
  };
}
