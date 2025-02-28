import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import useArticulos from "../../hook/useArticulos";
import FormularioArticulos from "./FormularioArticulos";
import PopupArticulo from "./PopupArticulo";
import API_PREFIX from "../../config/api";

const ListadoDeArticulos = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [articuloAEliminar, setArticuloAEliminar] = useState(null);
  const [articulos, setArticulos] = useState([]);
  const { guardarArticulo, actualizarArticulo, eliminarArticulo, setEditando } =
    useArticulos();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    obtenerArticulos();
  }, [refresh]);

  useEffect(() => {
    console.log("Artículos en ListadoDeArticulos:", articulos);
  }, [articulos]);

  const obtenerArticulos = async () => {
    try {
      const response = await fetch(`${API_PREFIX}/api/articulos`);
      if (response.ok) {
        const data = await response.json();
        setArticulos(data);
      } else {
        console.error("Error al obtener los artículos:", response.statusText);
      }
    } catch (error) {
      console.error("Error al obtener los artículos:", error);
    }
  };

  const handleOpenPopup = (articulo = null) => {
    setSelectedArticulo(articulo);
    setEditando(articulo);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedArticulo(null);
  };

  const handleFormSubmit = async (articuloData) => {
    try {
      if (selectedArticulo) {
        await actualizarArticulo(selectedArticulo._id, articuloData);
      } else {
        await guardarArticulo(articuloData);
      }
      setIsPopupOpen(false);
      setSelectedArticulo(null);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
    }
  };

  const handleClickEliminar = (articuloId) => {
    setArticuloAEliminar(articuloId);
    setShowWarning(true);
  };

  const confirmEliminar = async () => {
    try {
      if (articuloAEliminar) {
        await eliminarArticulo(articuloAEliminar);
        setRefresh((prev) => prev + 1);
        setShowWarning(false);
        setArticuloAEliminar(null);
      }
    } catch (error) {
      console.error("Error al eliminar el artículo:", error);
    }
  };

  const cancelEliminar = () => {
    setShowWarning(false);
    setArticuloAEliminar(null);
  };

  if (!articulos) {
    return <div>Cargando artículos...</div>;
  }

  return (
    <>
      <div className="flex mb-4">
        <div className="flex space-x-4">
          <Link to="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ml-4"
          >
            Volver
          </Link>
          <button
            onClick={() => handleOpenPopup()}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded absolute right-4 mt-4"
          >
            Crear artículo
          </button>
        </div>
      </div>
      {isPopupOpen && (
        <PopupArticulo onClose={handleClosePopup}>
          <FormularioArticulos
            articulo={selectedArticulo}
            onSubmit={handleFormSubmit}
            onClose={handleClosePopup}
          />
        </PopupArticulo>
      )}

      <h1 className="text-center text-white font-bold mb-4 text-2xl [text-shadow:_0px_0px_10px_#000000]">ARTÍCULOS</h1>


      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Unidad
            </th>
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Precio mostrador
            </th>
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Sector preparación
            </th>
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Precios por localidad
            </th>
            <th className="px-6 py-3 font-bold leading-4 tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((articulo) => (
            <tr key={articulo._id} className="bg-white even:bg-gray-100">
              <td className="px-5 py-2 text-center border text-black">
                {articulo.codigo}
              </td>
              <td className="px-5 py-2 text-center border text-black">
                {articulo.nombre}
              </td>
              <td className="px-5 py-2 text-center border text-black">
                {articulo.unidad}
              </td>
              <td className="px-5 py-2 text-center border text-black">
                {articulo.precioMostrador}
              </td>
              <td className="px-5 py-2 text-center border text-black">
                {articulo.lugarPreparacion}
              </td>
              <td className="px-5 py-2 text-center border text-black">
                {articulo.precios && articulo.precios.length > 0 ? (
                  articulo.precios.map((precio) => (
                    <div key={precio.localidad._id}>
                      {precio.localidad.nombre}: {precio.precio}
                    </div>
                  ))
                ) : (
                  <div>No hay precios disponibles</div>
                )}
              </td>
              <td className="px-5 py-2 text-center border text-black">
                <button
                  onClick={() => handleOpenPopup(articulo)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2 font-bold"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleClickEliminar(articulo._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar este artículo?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmEliminar}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sí
              </button>
              <button
                onClick={cancelEliminar}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListadoDeArticulos;
