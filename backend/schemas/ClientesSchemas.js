import Join from "@hapi/joi";

const clienteSchema = Join.object({
  codigo: Join.number(),
  nombre: Join.string(),
  apellido: Join.string(),
  localidad: Join.string().required(),
  direccion: Join.string().required(),
  celular: Join.number(),
  articuloData: Join.array().items(
    Join.object({
      productoId: Join.string().required(),
      nombre: Join.string(),
      cantidad: Join.number().integer().min(1).required(),
      descuentoPorArt: Join.number(),
    })
  ),
});

export default clienteSchema;
