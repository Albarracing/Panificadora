import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import API_PREFIX from "../../config/api";

const ListaRepartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [nombre, setNombre] = useState("");
  const [alias, setAlias] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRepartidor, setEditingRepartidor] = useState(null);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchRepartidores();
  }, []);

  const fetchRepartidores = async () => {
    try {
      const response = await axios.get(`${API_PREFIX}/api/repartidores`);
      setRepartidores(response.data);
    } catch (error) {
      console.error("Error al obtener los repartidores:", error);
    }
  };

  const handleCrearRepartidor = async () => {
    if (editingRepartidor) {
      try {
        const response = await axios.put(
          `${API_PREFIX}/api/repartidores/${editingRepartidor._id}`,
          { nombre, alias }
        );
        console.log("Repartidor actualizado:", response.data);
        setMessage("Repartidor actualizado exitosamente");
      } catch (error) {
        console.error("Error al actualizar el repartidor:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `${API_PREFIX}/api/repartidores`,
          {
            nombre,
            alias,
          }
        );
        console.log("Repartidor creado:", response.data);
        setMessage("Repartidor creado exitosamente");
      } catch (error) {
        console.error("Error al crear el repartidor:", error);
      }
    }

    setShowModal(false);
    fetchRepartidores();
    setNombre("");
    setAlias("");
    setEditingRepartidor(null);

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleEliminarRepartidor = async () => {
    try {
      await axios.delete(`${API_PREFIX}/api/repartidores/${deleteId}`);
      console.log("Repartidor eliminado:", deleteId);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchRepartidores();
      setMessage("Repartidor eliminado exitosamente");

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error al eliminar el repartidor:", error);
    }
  };

  const handleEditRepartidor = (repartidor) => {
    setEditingRepartidor(repartidor);
    setNombre(repartidor.nombre);
    setAlias(repartidor.alias);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNombre("");
    setAlias("");
    setEditingRepartidor(null);
  };

  return (
     <>

      <div className=" flex mb-4">
        <div className="flex space-x-4">
          {message && (
            <div className="bg-green-100 text-green-800 p-2 mb-4 rounded">
              {message}
            </div>
          )}
          <Link to="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ml-4">
            Volver
          </Link>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded absolute right-4 mt-4"
            onClick={() => setShowModal(true)}
          >
            Crear repartidor
          </button>
        </div>
      </div >

      {/* Modal para crear o editar repartidor */}
      {
        showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-md w-1/3 relative">
              <button
                className=" bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-6 right-6 absolute bottom-0 font-bold"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
              <h2 className="text-xl font-bold mb-4">
                {editingRepartidor
                  ? "Editar repartidor"
                  : "Crear nuevo repartidor"}
              </h2>
              <input
                className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <input
                className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
                type="text"
                placeholder="Alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold"
                onClick={handleCrearRepartidor}
              >
                {editingRepartidor ? "Actualizar repartidor" : "Crear repartidor"}
              </button>
            </div>
          </div>
        )
      }

      {/* Confirmación de eliminación */}
      {
        showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-md w-1/3 relative">
              <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
              <p>¿Estás seguro de que deseas eliminar este repartidor?</p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleEliminarRepartidor}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )
      }

      <h1 className="text-center text-white font-bold mb-4 text-2xl [text-shadow:_0px_0px_10px_#000000]">REPARTIDORES</h1>


      {/* Tabla de repartidores */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-2 text-center border">
              Nombre
            </th>
            <th className="px-2 py-2 text-center border">
              Alias
            </th>
            <th className="px-2 py-2 text-center border">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(repartidores) &&
            repartidores.map((repartidor) => (
              <tr key={repartidor._id} className="bg-white even:bg-gray-100">
                <td className="px-5 py-2 text-center border text-black">
                  {repartidor.nombre}
                </td>
                <td className="px-5 py-2 text-center border text-black">
                  {repartidor.alias}
                </td>
                <td className="px-5 py-2 text-center border text-black">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2 font-bold"
                    onClick={() => handleEditRepartidor(repartidor)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
                    onClick={() => {
                      setDeleteId(repartidor._id);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default ListaRepartidores;
