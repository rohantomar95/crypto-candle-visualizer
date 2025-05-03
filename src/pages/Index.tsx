
import CandleChart from "../components/CryptoChart/CandleChart";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] p-4">
      <div className="w-full max-w-7xl">
        <CandleChart />
      </div>
    </div>
  );
};

export default Index;
