import Image from "next/image";

export function DessaLogo() {
  return (
    <Image
      src="/dessa-system-simple.svg"
      alt="DESSA"
      width={120}
      height={22}
      priority
    />
  );
}
