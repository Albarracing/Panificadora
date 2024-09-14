import React from "react";
import CuentaCorrienteView from "../componentes/cuentaCorriente/CuentaCorrienteView";

const CuentaCorriente = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-[url('./assets/Panadera.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40">
        <div className="bg-black/60 py-5">
          <p className="text-white uppercase text-center text-3xl">
            Sistema de gestión de panificadora
          </p>
        </div>
        <div className="flex-grow flex  bg-black/60">
          <div className="w-full max-w-7xl mx-auto ">
            <CuentaCorrienteView />
          </div>
        </div>
      </div>
    </>
  );
};

export default CuentaCorriente;
