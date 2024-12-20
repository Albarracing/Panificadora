import React, { useState } from "react";
import PropTypes from "prop-types";
import { useLocation, Link } from "react-router-dom";
//import RepartoUtils from "../../utils/RepartoUtils";

const FormularioRepDet = ({
  clientesArticulos, // Lista de clientes y sus artículos
  localidades, // Lista de localidades para el filtro
  filteredClientes, // Clientes filtrados por localidad/tipo
  reparto, // Datos del reparto actual
  numeroPedido, // Número de pedido actual
  tempCantidadDevuelta, // Estado temporal de cantidades devueltas
  selectedLocalidad, // Localidad seleccionada en el filtro
  selectedTipoCliente, // Tipo de cliente seleccionado
  loading, // Estado de carga
  handleLocalidadChange, // Maneja cambios en el filtro de localidad
  handleTipoClienteChange, // Maneja cambios en el filtro de tipo
  handlePagoCompletoChangeLocal, // Maneja el checkbox de pago completo
  handleMontoPagadoChange, // Maneja cambios en el monto pagado
  handleCantidadDevueltaChange, // Maneja cambios en cantidades devueltas
  handleCantidadDevueltaBlur, // Maneja cuando se pierde el foco en cantidades
  handleGuardarCambios, // Maneja el guardado de cambios
  calcularImporteTotalReparto, // Calcula el total del reparto
  errores,
  generarPDF,
}) => {
  return (
    <div className="container mx-auto " id="reparto-details">
      <Link
        to="/RepartosNuevo"
        className="m-3 my-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver
      </Link>
      <div className="flex space-x-4 items-center mb-4 m-3">
        {/* Filtro por localidad */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-bold text-sm mb-1">
            Localidad:
          </label>
          <select
            value={selectedLocalidad}
            onChange={handleLocalidadChange}
            className="w-40 px-2 py-1 border rounded-md text-sm"
          >
            <option value="">Seleccionar</option>
            {localidades.map((localidad) => (
              <option key={localidad._id} value={localidad._id}>
                {localidad.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por tipo de cliente */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-bold text-sm mb-1">
            Tipo de cliente:
          </label>
          <select
            value={selectedTipoCliente}
            onChange={handleTipoClienteChange}
            className="w-40 px-2 py-1 border rounded-md text-sm"
          >
            <option value="">Seleccionar</option>
            <option value="lista">Lista</option>
            <option value="individual">Individual</option>
          </select>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4 mt-4 m-3">
        Detalles del reparto N°: {numeroPedido}
      </h1>

      <h2 className="text-lg mb-4 m-3">
        Fecha del reparto:{""}
        {reparto
          ? new Date(reparto.fecha).toLocaleDateString()
          : "Fecha no disponible"}
      </h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <div className="flex flex-col space-y-4 m-3">
            {filteredClientes.map((clienteArticulo) => (
              <div
                key={clienteArticulo._id}
                className="border p-4 rounded-lg shadow-md bg-white"
              >
                {/* Sección superior: Info del cliente y totales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Columna izquierda: Información del cliente */}
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {clienteArticulo.clienteId.nombre}{" "}
                      {clienteArticulo.clienteId.apellido}
                    </h2>
                  </div>
                  
                  {/* Columna derecha: Totales */}
                  <div className="flex justify-end space-x-6">
                    <div className="text-lg">
                      <span className="font-medium">Importe total:</span>{" "}
                      <span className="text-blue-600">
                        ${(clienteArticulo.totalCliente || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-lg">
                      <span className="font-medium">Deuda:</span>{" "}
                      <span className="text-red-600">
                        ${clienteArticulo.deuda.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección media: Lista de artículos */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {clienteArticulo.articulos.map((articulo, index) => (
                      <div
                        key={articulo.articuloId?._id || index}
                        className="bg-gray-50 p-2 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-medium ">
                            {articulo.nombre || "Nombre no disponible"}
                          </div>
                          <div className="flex items-center text-lg text-gray-600 space-x-2">
                            <span>Cantidad: {articulo.cantidad}</span>
                            <span>-</span>
                            <span>${(articulo.importe || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center ">
                          <label className="text-lg ">Devuelve:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={articulo.cantidad}
                            value={
                              tempCantidadDevuelta[
                                `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
                              ] ||
                              articulo.cantidadDevuelta ||
                              ""
                            }
                            onChange={(e) => {
                              const valor = Math.max(
                                0,
                                Math.min(
                                  parseFloat(e.target.value) || 0,
                                  articulo.cantidad
                                )
                              );
                              handleCantidadDevueltaChange(
                                clienteArticulo.clienteId._id,
                                articulo.articuloId._id,
                                valor
                              );
                            }}
                            onBlur={() =>
                              handleCantidadDevueltaBlur(
                                clienteArticulo.clienteId._id,
                                articulo.articuloId._id
                              )
                            }
                            className={`w-16 h-7 rounded border text-sm ${
                              errores[
                                `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
                              ]
                                ? "border-red-500"
                                : "border-gray-300"
                            } px-1`}
                          />
                        </div>
                        {errores[
                          `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
                        ] && (
                          <div className="absolute -bottom-4 left-0 right-0 text-red-500 text-xs text-center">
                            {errores[
                              `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
                            ].join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sección inferior: Controles de pago */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-6 text-sm">
                      <div>
                        <span className="font-medium">Pagado:</span>{" "}
                        <span className="text-green-600">
                          ${clienteArticulo.montoPagado
                            ? clienteArticulo.montoPagado.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Restante:</span>{" "}
                        <span className="text-red-600">
                          ${(
                            clienteArticulo.totalCliente -
                            (clienteArticulo.montoPagado || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={clienteArticulo.pagadoCompleto}
                          onChange={(e) =>
                            handlePagoCompletoChangeLocal(
                              clienteArticulo.clienteId._id,
                              e.target.checked
                            )
                          }
                        />
                        <span className="ml-2 font-medium">Pagado completo</span>
                      </label>

                      {!clienteArticulo.pagadoCompleto && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Monto pagado:</span>
                          <input
                            type="number"
                            value={clienteArticulo.montoPagado || ""}
                            onChange={(e) =>
                              handleMontoPagadoChange(
                                clienteArticulo.clienteId._id,
                                parseFloat(e.target.value)
                              )
                            }
                            className={`w-32 rounded-md border ${
                              errores[`monto_${clienteArticulo.clienteId._id}`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } p-1`}
                          />
                          {errores[`monto_${clienteArticulo.clienteId._id}`] && (
                            <span className="text-red-500 text-xs">
                              {errores[`monto_${clienteArticulo.clienteId._id}`]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de totales y botones */}
          <div className="bg-white rounded-lg shadow-md p-4 m-3">
            <div className="text-xl font-semibold mb-4">
              Importe total del reparto: $
              {calcularImporteTotalReparto().toFixed(2)}
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleGuardarCambios}
                disabled={Object.keys(errores).length > 0}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
              >
                Guardar cambios
              </button>
              <button
                onClick={generarPDF}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg"
              >
                Generar PDF
              </button>
              {Object.keys(errores).length > 0 && (
                <span className="text-red-500">
                  Hay errores que deben corregirse antes de guardar
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Después del componente FormularioRepDet y antes del export
FormularioRepDet.propTypes = {
  clientesArticulos: PropTypes.array.isRequired,
  localidades: PropTypes.array.isRequired,
  filteredClientes: PropTypes.array.isRequired,
  reparto: PropTypes.object,
  numeroPedido: PropTypes.string,
  tempCantidadDevuelta: PropTypes.object.isRequired,
  selectedLocalidad: PropTypes.string,
  selectedTipoCliente: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  handleLocalidadChange: PropTypes.func.isRequired,
  handleTipoClienteChange: PropTypes.func.isRequired,
  handlePagoCompletoChangeLocal: PropTypes.func.isRequired,
  handleMontoPagadoChange: PropTypes.func.isRequired,
  handleCantidadDevueltaChange: PropTypes.func.isRequired,
  handleCantidadDevueltaBlur: PropTypes.func.isRequired,
  handleGuardarCambios: PropTypes.func.isRequired,
  calcularImporteTotalReparto: PropTypes.func.isRequired,
  errores: PropTypes.object.isRequired,
  generarPDF: PropTypes.func.isRequired,
};

export default FormularioRepDet;
