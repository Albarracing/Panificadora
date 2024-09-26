import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ClientesContext = createContext();

export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState({});
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const obtenerClientes = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/clientes");
      setClientes(response.data);
    } catch (error) {
      setError("Error al obtener los clientes");
    } finally {
      setCargando(false);
    }
  };

  const obtenerCliente = async (id) => {
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/clientes/${id}`
      );
      setCliente(response.data.cliente);
      setArticulos(response.data.articulos); // Guardar los artículos
    } catch (error) {
      setError("Error al obtener el cliente");
    } finally {
      setCargando(false);
    }
  };

  const obtenerArticulosCliente = async (clienteId) => {
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/clientes/${clienteId}/`
      );
      return response.data;
    } catch (error) {
      setError("Error al obtener los artículos del cliente");
      console.error(error);
      throw error;
    } finally {
      setCargando(false);
    }
  };

  const guardarCliente = async (clienteData) => {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/clientes",
        clienteData
      );
      setClientes((prevClientes) => [...prevClientes, data.cliente]);
      console.log("Cliente creado:", data.cliente);
      return data;
    } catch (error) {
      console.error("Error al crear cliente:", error.response.data);
      throw error;
    }
  };

  const actualizarCliente = async (clienteData, id) => {
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/clientes/${id}`,
        clienteData
      );
      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>
          cliente._id === id ? data.clienteActualizado : cliente
        )
      );
      console.log("Cliente actualizado:", data.clienteActualizado);
      return data;
    } catch (error) {
      console.error("Error al actualizar cliente:", error.response.data);
      throw error;
    }
  };

  const setEditando = (cliente) => {
    console.log("Cliente a editar:", cliente);
    setCliente(cliente);
  };

  const eliminarCliente = async (id) => {
    try {
      if (!id) {
        throw new Error("ID no proporcionado");
      }

      const url = `http://localhost:3000/api/clientes/${id}`;
      const { data } = await axios.delete(url);
      setClientes((prevClientes) =>
        prevClientes.filter((cliente) => cliente._id !== id)
      );
      console.log("Cliente eliminado:", id);
      return data;
    } catch (error) {
      console.error(`Error al eliminar el cliente con ID: ${id}`, error);
      throw error;
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        obtenerClientes,
        obtenerCliente,
        obtenerArticulosCliente,
        guardarCliente,
        actualizarCliente,
        setEditando,
        cliente,
        articulos,
        eliminarCliente,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
};

export default ClientesContext;
