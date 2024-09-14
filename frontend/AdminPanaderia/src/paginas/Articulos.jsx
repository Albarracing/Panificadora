import React from "react";
import ListadoDeArticulos from "../componentes/articulos/ListadoArticulos";

const Articulos = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[url('./assets/Panadera.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40">
      <div className="bg-black/60 py-5">
        <p className="text-white uppercase text-center text-3xl">
          SISTEMA DE GESTIÓN DE PANIFICADORAS
        </p>
      </div>
      <div className="">
        <ListadoDeArticulos />
      </div>
    </div>
  );
};

export default Articulos;
