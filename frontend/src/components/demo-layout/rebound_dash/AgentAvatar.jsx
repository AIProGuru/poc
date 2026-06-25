import { getAgentAvatarSrc } from "../../../utils/aiAgentAvatars";

const AgentAvatar = ({ name, size = 40, className = "" }) => {
  const src = getAgentAvatarSrc(name);
  if (!src) return null;

  return (
    <img
      src={encodeURI(src)}
      alt={`${name} avatar`}
      width={size}
      height={size}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default AgentAvatar;
