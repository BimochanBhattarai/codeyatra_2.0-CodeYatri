const Footer = () => {
  return (
    <div className="border-t-2 border-t-gray-100 w-full bg-white p-4">
      <div className="container flex items-center justify-center sm:justify-between flex-col sm:flex-row gap-3 sm:gap-0">
        <div className="text-sm text-gray-400 font-medium tracking-wide text-center sm:text-left">
          <span className="text-red-500 font-bold">Uddhar</span> Emergency
          Response Network
          <div className="text-gray-300 font-normal normal-case mt-0.5">
            © {new Date().getFullYear()} All Rights Reserved.
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-red-500 font-bold uppercase">
          <span className="animate-pulse text-xl leading-0">●</span>
          <span>dial 100 · 101 · 102 for emergencies</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
