import React from "react";
import RepartoNuevo from "./RepartoNuevo";
import useClientes from "../../hook/useClientes";

const RepartoNuevoListado = () => {
  const { clientes } = useClientes();
  return (
    <div>
      {clientes.map((cliente) => (
        <RepartoNuevo key={cliente._id} cliente={cliente} />
      ))}
    </div>
  );
};

export default RepartoNuevoListado;
