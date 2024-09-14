// import React from "react";
// import { Link } from "react-router-dom";

// const Home = () => {
//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       <div className="bg-black py-5">
//         <p className="text-white uppercase text-center text-4xl font-bold">
//           Panadería Teodelina
//         </p>
//       </div>
//       <div className="flex flex-col items-center justify-center mt-10 px-22">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20">
//           <Link to="/Clientes">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Clientes
//             </button>
//           </Link>
//           <Link to="/Articulos">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Artículos
//             </button>
//           </Link>
//           <Link to="/RepartosNuevo">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Repartos
//             </button>
//           </Link>
//           <Link to="/Repartidores">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Repartidores
//             </button>
//           </Link>
//           <Link to="/Localidades">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Localidades
//             </button>
//           </Link>
//           <Link to="/Listados">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Listados
//             </button>
//           </Link>
//           <Link to="/CuentaCorriente">
//             <button className="bg-indigo-600 hover:bg-indigo-500 w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 shadow-lg">
//               Cuenta Corriente
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { IoIosPeople } from "react-icons/io";
import { AiFillProduct } from "react-icons/ai";
import { FaTruckMoving } from "react-icons/fa";
import { GrUserWorker } from "react-icons/gr";
import { FaCity } from "react-icons/fa";
import { IoIosPaper } from "react-icons/io";
import { GiCroissant } from "react-icons/gi";
import { MdAccountBalance } from "react-icons/md";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[url('./assets/Panadero.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40	">
      <div className="flex items-center justify-between bg-black/60 py-6 px-10 ">
        <img src={Logo} alt="Logo" className="w-32" />
        <p className="text-white uppercase text-center text-4xl font-bold ">
          Sistema de gestión de panificadora
        </p>
      </div>
      <div className="flex flex-col items-center justify-center mt-20 	">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20">
          <Link to="/Clientes">
            <button className="border-2 border-black flex items-center justify-around bg-black/60 hover:bg-black  w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300">
              <IoIosPeople className="w-20 h-20" />
              Clientes
            </button>
          </Link>
          <Link to="/Articulos">
            <button className="border-2 border-black flex items-center justify-around  bg-black/60 hover:bg-black w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 ">
              <GiCroissant className="w-12 h-12" />
              Artículos
            </button>
          </Link>
          <Link to="/RepartosNuevo">
            <button className="border-2 border-black flex items-center justify-around  bg-black/60 hover:bg-black w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 ">
              <FaTruckMoving className="w-16 h-16" />
              Repartos
            </button>
          </Link>
          <Link to="/Repartidores">
            <button className="border-2 border-black flex items-center justify-around bg-black/60 hover:bg-black w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 ">
              <GrUserWorker className="w-14 h-14" />
              Repartidores
            </button>
          </Link>
          <Link to="/Localidades">
            <button className="border-2 border-black flex items-center justify-around bg-black/60 hover:bg-black w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 ">
              <FaCity className="w-16 h-16" />
              Localidades
            </button>
          </Link>
          <Link to="/Listados">
            <button className="border-2 border-black flex items-center justify-around bg-black/60 hover:bg-black w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 ">
              <IoIosPaper className="w-16 h-16" />
              Listados
            </button>
          </Link>
          <Link to="/CuentaCorriente">
            <button className="border-2 border-black flex items-center justify-around bg-black/60 hover:bg-black w-52 h-16 rounded-md uppercase text-white font-semibold transition duration-300 ">
              <MdAccountBalance className="w-12 h-12" />
              Cuenta Corriente
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
