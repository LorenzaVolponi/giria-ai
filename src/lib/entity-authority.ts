export function buildEntityAuthority(site: string) {
  const volponi = "https://volponi.tech";
  const instagram = "https://www.instagram.com/lorenzavolponi/";

  return {
    ids: {
      product: `${site}/#organization`,
      website: `${site}/#website`,
      dictionary: `${site}/#dictionary`,
      aix8c: `${site}/#aix8c`,
      creator: `${site}/#lorenza-volponi`,
      parent: `${volponi}/#organization`,
    },
    graph: [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: "Gíria AI",
        url: site,
        logo: `${site}/logo.svg`,
        parentOrganization: { "@id": `${site}/#aix8c` },
        knowsAbout: ["gírias brasileiras", "memes", "linguagem informal brasileira", "cultura digital"],
      },
      {
        "@type": "Organization",
        "@id": `${site}/#aix8c`,
        name: "AIX8C",
        url: volponi,
        description: "Tecnologia autoral e open source do ecossistema volponi.tech.",
        parentOrganization: { "@id": `${volponi}/#organization` },
        founder: { "@id": `${site}/#lorenza-volponi` },
      },
      {
        "@type": "Organization",
        "@id": `${volponi}/#organization`,
        name: "volponi.tech",
        url: volponi,
      },
      {
        "@type": "Person",
        "@id": `${site}/#lorenza-volponi`,
        name: "Lorenza Volponi",
        url: instagram,
        sameAs: [instagram],
        affiliation: { "@id": `${site}/#aix8c` },
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        name: "Gíria AI",
        url: site,
        inLanguage: "pt-BR",
        publisher: { "@id": `${site}/#organization` },
        creator: { "@id": `${site}/#aix8c` },
      },
    ],
  };
}
