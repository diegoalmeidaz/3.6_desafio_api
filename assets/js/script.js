let clpInput = document.querySelector("#clpInput");
let fiatSelector = document.querySelector("#selectorMoneda");
let btn = document.querySelector("#calcular")
let result = document.querySelector("#resultadoMonedaConvertida");
let serverState = document.querySelector("#conexionServidor")
const myChart = document.querySelector("#myChart");
const urlApi = "https://mindicador.cl/api/";

let dateLabelArray = [];
let dataCurrencyArray = [];
let canvas;

// Api conection code (and first connection test)

const getMoney = async () => {
    try{
        const response = await fetch(urlApi);
        const moneyData = await response.json();
        console.log("valor", moneyData)
        return moneyData;
    } catch (error) {
        alert(error.message);
        console.log(error)
    }
    
}

// template

const template = (moneda) => {
    let html = "";
    html += `
    <option value="${moneda["valor"]}">${moneda["codigo"]}</option>
    `
    return html
}

// Pick Fiat coin, talk to the server and asign it to the selector

async function fiatRender() {
    
    try{
        const monedas = await getMoney();
        let html = "";
        Object.entries(monedas).forEach(([key, moneda]) => {
            if (typeof moneda === 'object') {
                html += template(moneda)
            }
        });
        fiatSelector.innerHTML = html;
        serverState.innerHTML = "Conexion Establecida Correctamente"
    }
    catch(error){
        serverState.innerHTML = "Conexión No Establecida Con Servidor"
        console.error(error)
    }
}
fiatRender()

//Function conversion + Graph Render 

const conversion = () => {
    fiatValor = fiatSelector.value
    clpValor = clpInput.value;
    resultadoTotal = clpValor/ fiatValor
    currency = fiatSelector.options[fiatSelector.selectedIndex].text
    result.innerHTML = "Tus Pesos equivalen a: " + resultadoTotal.toFixed(2) + " " + currency
    
    renderGrafica (currency)
}



async function getCurrencyData(currency) {
    currency = fiatSelector.options[fiatSelector.selectedIndex].text
    const response = await fetch(`${urlApi}${currency}`);
    const moneyDataCurrency = await response.json();
    console.log (moneyDataCurrency)
    const data = moneyDataCurrency.serie.map((x) => x.valor);
    const days = moneyDataCurrency.serie.slice(0,10).map((x) =>x.fecha.split("T")[0]);

    dateLabelArray = days
    dataCurrencyArray = data
}






async function renderGrafica (currency) {
    if (canvas) canvas.destroy ();
    
    await getCurrencyData()

    const myChart = document.querySelector("#myChart").getContext("2d");
    
        canvas = new Chart(myChart, {
       
        type: 'line',

   
        data: {
            labels: dateLabelArray,
            datasets: [{
                label: `Evolución 10 Dias ${currency}`,
                backgroundColor: 'white',
                borderColor: '#007bff',
                data: dataCurrencyArray,
                fillColor: 'white',
            },
            
        ]
        },

    // Configuration options go here
    options: {
      tooltips: {
        mode: 'index'
      }
    }
    })

    

}

// On click event to activate conversion & some styling while listening the click

btn.addEventListener("click", async (e) => {
    e.preventDefault();
    await conversion(fiatSelector.value);
    myChart.style.backgroundColor = "white"
});






