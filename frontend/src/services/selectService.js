// selectService.js


export async function getDocumentTypes() {
    const res = await fetch("/src/data/selects/documentTypes.json")
    return res.json();
}

export async function getCategoryTypes() {
    const res = await fetch("/src/data/selects/categoryTypes.json")
    return res.json();
}

export async function getRoles() {
  const res = await fetch("/src/data/selects/roles.json");
  return res.json();
}

