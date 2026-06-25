export const AI_AGENTS = [
  { name: "David", image: "/agents (1).png" },
  { name: "Carrie", image: "/agents (2).png" },
  { name: "Ivan", image: "/agents (3).png" },
  { name: "Chase", image: "/agents (4).png" },
  { name: "April", image: "/agents (5).png" },
  { name: "Poppy", image: "/agents (6).png" },
];

export const getAgentAvatarSrc = (agentName) => {
  const label = `${agentName || ""}`.trim().toLowerCase();
  if (!label) return null;

  const match = AI_AGENTS.find(({ name }) => {
    const key = name.toLowerCase();
    return label === key || label.startsWith(`${key} `) || label.startsWith(key);
  });

  return match?.image ?? null;
};
