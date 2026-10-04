// Identifiant anonyme de visite (conservé dans le navigateur) : relie le chat et le formulaire.
export function getSessionId(): string {
  try {
    let id = localStorage.getItem("sid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sid", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
