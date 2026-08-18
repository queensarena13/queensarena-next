import { getTeamLogoUrl } from "@/lib/team-logos"

interface Props {
  name: string
  logoUrl?: string | null
  size?: number
}

export function TeamAvatar({
  name,
  logoUrl,
  size = 56,
}: Props) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const resolvedLogoUrl = getTeamLogoUrl(name, logoUrl)

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-lg
        border
        border-white/[0.08]
        bg-white
        text-sm
        font-black
        text-black
      "
    >
      {resolvedLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedLogoUrl}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain p-1.5"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
          {initials}
        </span>
      )}
    </div>
  )
}
