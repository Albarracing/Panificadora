import React from "react";
import { Link } from "react-router-dom";

const Listados = () => {
  return (
    <div className="flex flex-col bg-[url('./assets/Panadera.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40 min-h-screen bg-gray-100">
      <div className="bg-black/60 py-5">
        <p className="text-white uppercase text-center text-3xl">
          SISTEMA DE GESTIÓN DE PANIFICADORA
        </p>
      </div>
      <div className="flex justify-between items-center m-5">
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Volver
        </Link>
      </div>
      <h1 className="text-center text-white font-bold mb-4 text-2xl [text-shadow:_0px_0px_10px_#000000]">LISTADOS</h1>

      <div className="flex flex-wrap gap-6 ml-4 justify-center">
        <Link to="/ListadoVueltas">
          <button className="bg-red-600 hover:bg-red-500 w-60 h-12 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
            Vueltas
          </button>
        </Link>
        <Link to="/ListadoIndividual">
          <button className="bg-cyan-500 hover:bg-cyan-600 w-60 h-12 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
            Individual
          </button>
        </Link>
        <Link to="/ListadoRepartidor">
          <button className="bg-amber-400 hover:bg-amber-500 w-60 h-12 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
            Lista
          </button>
        </Link>
        <Link to="/ListadoProductos">
          <button className="bg-indigo-600 hover:bg-indigo-500 w-60 h-12 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
            Productos
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Listados;
