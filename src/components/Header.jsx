import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <div className="p-4 border-b-2 border-b-gray-100 w-full bg-white flex items-center justify-center">
      <div className="container flex items-center justify-center sm:justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="uddhar logo" width={104} height={104} />
        </Link>
        <div className="text-xs text-red-500 font-bold uppercase hidden sm:flex flex-col items-end">
          <div className="flex items-center justify-center gap-1">
            <span className="animate-pulse text-xl leading-0">●</span>
            <span>emergency services active</span>
          </div>
          <div className="text-black font-medium">
            {new Date().toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
            {" | "}
            {new Date().toLocaleString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
