import ULMLogo from "@app/assets/ULM-fs8.png";
import PuskesmasLogo from "@app/assets/puskesmas-fs8.png";

const Header = ({ className }: { className: string } = { className: "" }) => {
  return (
    <div>
      <header className={`absolute bg-gray-50/10 backdrop-blur-sm p-4 bg-inset shadow-lg w-full ${className} `}>
        <div className="container mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img src={ULMLogo} className="size-10" />
            <img src={PuskesmasLogo} className="size-10" />
            <h1 className="text-3xl font-bold text-secondary">Puskesmas</h1>
          </div>
          <p className="text-muted w-11/12 text-sm ">Monitoring Suhu dan kelembapan Ruangan Puskesmas</p>
        </div>
      </header>
    </div>
  );
};

export default Header;
