export const AI_AGENTS = [
  { name: "David", image: "/agents (1).png" },
  { name: "Carrie", image: "/agents (2).png" },
  { name: "Ivan", image: "/agents (3).png" },
  { name: "Chase", image: "/agents (4).png" },
  { name: "April", image: "/agents (5).png" },
  { name: "Poppy", image: "/agents (6).png" },
];

const ROLE_TITLE_SUFFIX =
  /\s+(appealer|specialist|verifier|manager|analyst|coordinator|assistant|expert|handler|resolver)$/i;

export const formatAgentDisplayTitle = (modelTitle) => {
  const raw = `${modelTitle || ""}`.trim();
  if (!raw) return "Hi, I am your AI Agent";
  if (/^hi,\s*i am\s/i.test(raw)) return raw;

  const dashMatch = raw.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (!dashMatch) return raw;

  const name = dashMatch[1].trim();
  let domain = dashMatch[2].trim().replace(ROLE_TITLE_SUFFIX, "").trim();
  if (!domain) domain = dashMatch[2].trim();

  return `Hi, I am ${name}, Your ${domain} AI Agent`;
};

export const getAgentAvatarSrc = (agentName) => {
  const label = `${agentName || ""}`.trim().toLowerCase();
  if (!label) return null;

  const match = AI_AGENTS.find(({ name }) => {
    const key = name.toLowerCase();
    return label === key || label.startsWith(`${key} `) || label.startsWith(key);
  });

  return match?.image ?? null;
};
