interface CardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  iconStyle?: string;
  isPrimary?: boolean;
  isAboveThreshold?: boolean;
}

const ParamCard = ({ title, value, unit, icon: Icon, iconStyle, isPrimary, isAboveThreshold }: CardProps) => {
  return (
    <div className={`${isPrimary ? "bg-primary border border-secondary-muted" : "bg-secondary"} shadow-lg rounded-xl w-1/2 px-4 py-2 lg:w-full lg:h-full gap-2`}>
      <h1 className={`${isPrimary ? "text-secondary" : "text-primary"} text-xl mb-2 lg:hidden`}>{title}</h1>
      <div className="flex items-center w-full justify-between lg:hidden">
        <div className="flex flex-col gap-2">
          <h1 className={`${isPrimary ? "text-secondary" : "text-primary"} text-4xl font-bold`}>
            {value}
            <span className={`${isPrimary ? "text-muted" : "text-secondary-muted"} font-light`}>{unit}</span>
          </h1>
          <p className={`${isPrimary ? "text-muted" : "text-secondary-muted"} text-[11px]`}>
            Status <span className={`${isAboveThreshold ? "text-red-500" : "text-green-500"}`}>{isAboveThreshold ? "Tinggi" : "Normal"}</span>
          </p>
        </div>
        <Icon className={`${iconStyle}`} />
      </div>
      <div className="hidden lg:relative lg:flex lg:flex-col  w-full  h-full">
        <div className="flex justify-between items-center">
          <h1 className={`${isPrimary ? "text-secondary" : "text-primary"} text-2xl mb-2`}>{title}</h1>
          <Icon className={`${iconStyle}`} />
        </div>
        <div className="lg:absolute  size-full flex items-center justify-center">
          <div className="flex flex-col gap-4  items-center justify-center">
            <h1 className={`${isPrimary ? "text-secondary" : "text-primary"} text-5xl font-bold`}>
              {value}
              <span className={`${isPrimary ? "text-muted" : "text-secondary-muted"} font-light`}>{unit}</span>
            </h1>
            <p className={`${isPrimary ? "text-muted" : "text-secondary-muted"} text-2xl text-center`}>
              Status <span className={`${isAboveThreshold ? "text-red-500" : "text-green-500"}`}>{isAboveThreshold ? "Tinggi" : "Normal"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamCard;
