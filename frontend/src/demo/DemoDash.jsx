import { useSelector } from "react-redux";
import DataTable from "./DataTable";

const DemoDash = () => {
  const theme = useSelector((state) => state.app.theme);

  return (
    <div className={`flex flex-col  sm:ml-[0] gap-3 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-black'}`}>
      <DataTable />
    </div>
  );
};

export default DemoDash;
