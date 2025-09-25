import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("relative flex items-center h-10 w-28", className)}>
      <Image
        src="https://xno.vn/_next/image?url=%2Flogo.png&w=256&q=75"
        alt="XNO Quant Logo"
        fill
        className="object-contain"
        priority
      />
    </Link>
  );
};

export default Logo;
