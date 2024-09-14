import React from "react";
import RepartoTabla from "../componentes/repartosNuevo/RepartoTabla";

const RepartosNuevo = ({ cliente }) => {
  return (
    <div className="flex flex-col bg-[url('./assets/Panadera.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40">
      <div className="bg-black/60 py-5">
        <p className="text-white uppercase text-center text-3xl">
          SISTEMA DE GESTIÓN DE PANIFICADORa
        </p>
      </div>
      <div>
        <RepartoTabla />
      </div>
    </div>
  );
};

export default RepartosNuevo;
