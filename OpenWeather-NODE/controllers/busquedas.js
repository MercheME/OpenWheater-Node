const fs = require('fs');
const axios = require('axios');

class Busquedas {
    historial = [];
    dbPath = './db/historial.json';

    constructor() {
        // Leer historial si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        });
    }

    async buscarCiudad(ciudad = '') {
        try {
            const instancia = axios.create({
                baseURL: `https://api.maptiler.com/geocoding/${ciudad}.json`,
                params: {
                    key: process.env.MAPTILER_KEY
                }
            });

            const resp = await instancia.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.geometry.coordinates[0],
                lat: lugar.geometry.coordinates[1],
            }));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async obtenerClima(lat, lon) {
        try {
            const instancia = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {
                    lat,
                    lon,
                    appid: process.env.OPENWEATHER_KEY,
                    units: 'metric',
                    lang: 'es'
                }
            });

            const resp = await instancia.get();
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                temp: main.temp,
                min: main.temp_min,
                max: main.temp_max,
            };
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = '') {
        if (this.historial.includes(lugar.toLowerCase())) {
            return;
        }
        this.historial = this.historial.slice(0, 5); // max 6 elementos
        this.historial.unshift(lugar.toLowerCase());
        this.guardarDB();
    }

    guardarDB() {
        const datosGuardar = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(datosGuardar));
    }

    leerDB() {
        if (!fs.existsSync(this.dbPath)) return;

        try {
            const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
            const data = JSON.parse(info); 
            this.historial = data.historial || [];
        } catch (error) {
            console.log('Error al leer la base de datos:'.red, error.message);
            this.historial = []; // inicializar historial para que no de error
        }
    }
}

module.exports = Busquedas;
