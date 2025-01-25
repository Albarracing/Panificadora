import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API_PREFIX from "../config/api";

const ArticulosContext = createContext();

export const ArticulosProvider = ({ children }) => {
  const [articulos, setArticulos] = useState([]);
  const [articulo, setArticulo] = useState({});
  const [error, setError] = useState(null);

  // Obtén la URL base del backend desde la variable de entorno
  //const API_PREFI = process.env.REACT_APP_BACKEND_URL;

  const obtenerArticulos = async () => {
    try {
      const { data } = await axios.get(`${API_PREFIX}/api/articulos/`);
      setArticulos(data);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  useEffect(() => {
    obtenerArticulos();
  }, []);

  const guardarArticulo = async (articulo) => {
    try {
      console.log("Enviando artículo al backend:", articulo);
      const { data: articuloGuardado } = await axios.post(
        `${API_PREFIX}/api/articulos/`,
        articulo
      );
      console.log("Artículo guardado:", articuloGuardado);
      setArticulos([articuloGuardado, ...articulos]);
    } catch (error) {
      console.error("Error al guardar el artículo:", error);
      setError(error);
    }
  };

  const actualizarArticulo = async (id, articuloActualizado) => {
    try {
      console.log("Datos enviados:", articuloActualizado); // <-- Agregar este console.log
      const { data: articuloActualizadoResponse } = await axios.put(
        `${API_PREFIX}/api/articulos/${id}`,
        articuloActualizado
      );
      setArticulos(
        articulos.map((articulo) =>
          articulo._id === id ? articuloActualizadoResponse : articulo
        )
      );
    } catch (error) {
      console.error(error);
      setError(error);
    }
  };

  const setEditando = (articulo) => {
    setArticulo(articulo);
  };

  const eliminarArticulo = async (id) => {
    const confirmar = confirm("Seguro que deseas eliminar?");

    if (confirmar) {
      try {
        await axios.delete(`${API_PREFIX}/api/articulos/${id}`);
        const articulosActualizados = articulos.filter(
          (articuloState) => articuloState._id !== id
        );
        setArticulos(articulosActualizados);
      } catch (error) {
        console.log(error);
        setError(error);
      }
    }
  };

  return (
    <ArticulosContext.Provider
      value={{
        articulos,
        obtenerArticulos,
        guardarArticulo,
        actualizarArticulo,
        setEditando,
        articulo,
        eliminarArticulo,
        error,
      }}
    >
      {children}
    </ArticulosContext.Provider>
  );
};

export default ArticulosContext;
