require('dotenv').config();
require('colors');

const { guardarDB, leerDB } = require('./controllers/guardarArchivo');
const { inquirerMenu, 
        pausa,
        leerInput, 
        listarLugares
} = require('./helpers/inquirer');

const Busquedas = require('./controllers/busquedas');


const main = async() => {

    let opt = '';
    const busquedas = new Busquedas();

    //leemos de la DB
    const historialDB = leerDB();

    if ( historialDB ) { // cargar ciudades buscadas
        busquedas.leerDB();
    }

    do {
        // Imprimir el menú
        opt = await inquirerMenu();

        switch (opt) {
            case '1': // buscar ciudad
                const termino = await leerInput('Ciudad:');
                const lugares = await busquedas.buscarCiudad(termino);
                const idSeleccionado = await listarLugares(lugares);

                if (idSeleccionado == '0') continue;

                const lugarSeleccionado = lugares.find(lug => lug.id === idSeleccionado);

                // Guardar en el historial
                busquedas.agregarHistorial(lugarSeleccionado.nombre);

                // Obtener clima
                const clima = await busquedas.obtenerClima(lugarSeleccionado.lat, lugarSeleccionado.lng);

                // Mostrar resultados
                console.log('\nInformación del lugar\n'.green);
                console.log('Ciudad:', lugarSeleccionado.nombre);
                console.log('Lat:', lugarSeleccionado.lat);
                console.log('Lng:', lugarSeleccionado.lng);
                console.log('Clima:', clima.desc);
                console.log('Temperatura:', clima.temp, '°C');
                console.log('Mínima:', clima.min, '°C');
                console.log('Máxima:', clima.max, '°C');

                break;
            case '2': // Mostrar historial
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${lugar}`);
                });

                break;
        }

        //lo hacemos después del menú para tenerlo solo una vez y solo en este lugar.
        guardarDB( busquedas.historial );

        await pausa();

    } while( opt !== '0' );

}


main();

