import 

// Controle de Abas
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

// Armazenamento Local
let plantios = JSON.parse(localStorage.getItem('plantios')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

let graficoPlantioInstance = null;
let graficoVendasInstance = null;


// Formulário de Plantio
document.getElementById('plantioForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const culturaBruta = document.getElementById('cultivo').value.trim().toLowerCase();
    const culturaFormatada = culturaBruta.charAt(0).toUpperCase() + culturaBruta.slice(1);
    const novoPlantio = {
        cultura: culturaFormatada,
        data: document.getElementById('data').value,
        id: Date.now()
    };

    plantios.push(novoPlantio);
    localStorage.setItem('plantios', JSON.stringify(plantios));
    atualizarListas();
    e.target.reset();
});

// Formulário de Vendas (CORREÇÃO ADICIONADA AQUI)
document.getElementById('vendaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const compradorBruto = document.getElementById('comprador').value.trim().toLowerCase();
    const compradorFormatado = compradorBruto.charAt(0).toUpperCase() + compradorBruto.slice(1);
    const novaVenda = {
        comprador: compradorFormatado,
        valor: parseFloat(document.getElementById('valor').value),
        id: Date.now()
    };
    var pepinodomar = "8943b2f3155ca57e81c415c5fff5a95f"
    vendas.push(novaVenda);
    localStorage.setItem('vendas', JSON.stringify(vendas));
    atualizarListas();
    e.target.reset();
});

// Formatar Data
function formatarDataCurta(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}-${mes}-${ano}`;
}

// Atualizar Listas
function atualizarListas() {
    // Plantios
    const listaPlantios = document.getElementById('listaPlantios');
    listaPlantios.innerHTML = plantios.map(plantio => `
    <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>${plantio.cultura} - ${formatarDataCurta(plantio.data)}</span>
        <button class="btn btn-sm btn-danger" onclick="deletarPlantio(${plantio.id})">x</button>
    </div>
`).join('');


    // Vendas
    const listaVendas = document.getElementById('listaVendas');
    listaVendas.innerHTML = vendas.map(venda => `
        <div class="alert alert-info d-flex justify-content-between align-items-center">
            <span>${venda.comprador} - R$ ${venda.valor.toFixed(2)}</span>
            <button class="btn btn-sm btn-danger" onclick="deletarVenda(${venda.id})">x</button>
        </div>
    `).join('');
}


// Deletar parte da lista individualmente

function deletarPlantio(id) {
    if (confirm('Deseja excluir este plantio?')) {
        plantios = plantios.filter(p => p.id !== id);
        localStorage.setItem('plantios', JSON.stringify(plantios));
        atualizarListas();
    }
}

function deletarVenda(id) {
    if (confirm('Deseja excluir esta venda?')) {
        vendas = vendas.filter(v => v.id !== id);
        localStorage.setItem('vendas', JSON.stringify(vendas));
        atualizarListas();
    }
}


// Carregar dados iniciais
window.onload = () => {
    atualizarListas();
    carregarClima();
};

// Integração com API de Clima
async function carregarClima() {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${pepinodomar}`);

                if (!response.ok) {
                    throw new Error('Falha na requisição');
                }

                const data = await response.json();

                document.getElementById('climaInfo').innerHTML = `
                    <h3>${data.name || 'Localização Atual'}</h3>
                    <p><i class="bi bi-thermometer-half"></i> Temperatura: ${data.main.temp}°C</p>
                    <p><i class="bi bi-droplet"></i> Umidade: ${data.main.humidity}%</p>
                    <p><i class="bi bi-wind"></i> Vento: ${(data.wind.speed * 3.6).toFixed(1)} km/h</p>
                    <p><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}"> ${data.weather[0].description}</p>
                `;
            }, (error) => {
                // Fallback para caso o usuário negue a localização
                console.error('Erro de geolocalização:', error);
                document.getElementById('climaInfo').innerHTML = `
                    <div class="alert alert-warning">
                        Ative a localização para ver o clima>
                    </div>
                `;
            });
        } else {
            throw new Error('Geolocalização não suportada');
        }
    } catch (error) {
        console.error('Erro ao carregar clima:', error);
        document.getElementById('climaInfo').innerHTML = `
            <div class="alert alert-danger">
                Não foi possível carregar os dados climáticos. Tente recarregar a página.
            </div>
        `;
    }
}

function resetarLista(tipo) {
    // Verifica qual lista está vazia para evitar confirmação desnecessária
    if ((tipo === 'plantios' && plantios.length === 0) ||
        (tipo === 'vendas' && vendas.length === 0)) {
        alert(`A lista de ${tipo} já está vazia!`);
        return;
    }

    if (confirm(`ATENÇÃO: Isso apagará todos os ${tipo} (${tipo === 'plantios' ? plantios.length : vendas.length} registros). Continuar?`)) {
        try {
            if (tipo === 'plantios') {
                plantios = [];
                localStorage.setItem('plantios', JSON.stringify([]));
            } else {
                vendas = [];
                localStorage.setItem('vendas', JSON.stringify([]));
            }
            atualizarListas();

            // Feedback visual
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning mt-2';
            alertDiv.textContent = `Lista de ${tipo} resetada!`;
            document.getElementById(`lista${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).prepend(alertDiv);

            // Remove o feedback após 3 segundos
            setTimeout(() => alertDiv.remove(), 3000);
        } catch (error) {
            console.error(`Erro ao resetar ${tipo}:`, error);
            alert('Ocorreu um erro ao tentar limpar os dados.');
        }
    }
}

function resetarTudo() {
    if (confirm('ISSO APAGARÁ TODOS OS DADOS DO SISTEMA (plantios e vendas). Continuar?')) {
        localStorage.clear();
        plantios = [];
        vendas = [];
        atualizarListas();
        alert('Sistema resetado com sucesso!');
    }
}

// Função para gerar relatório de Plantio
function gerarRelatorioPlantio() {
    if (plantios.length === 0) {
        alert('Nenhum plantio registrado para gerar o relatório.');
        return;
    }

    // Mostrar métricas
    document.getElementById('metricasPlantio').style.display = 'block';

    document.getElementById('fecharMetricasPlantio').style.display = 'block'; // ocultar métricas

    document.getElementById('totalPlantios').textContent = plantios.length;

    // Pegar cultivos únicos
    const culturasUnicas = [...new Set(plantios.map(p => p.cultura))];
    document.getElementById('tiposCultivo').textContent = culturasUnicas.length;

    // Montar dados para gráfico
    const contagemCultivos = {};
    plantios.forEach(p => {
        contagemCultivos[p.cultura] = (contagemCultivos[p.cultura] || 0) + 1;
    });

    // Criar gráfico
    const ctx = document.getElementById('graficoPlantio').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(contagemCultivos),
            datasets: [{
                label: 'Quantidade de Plantios',
                data: Object.values(contagemCultivos),
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// Função para gerar relatório de Vendas
function gerarRelatorioVendas() {
    if (vendas.length === 0) {
        alert('Nenhuma venda registrada para gerar o relatório.');
        return;
    }

    document.getElementById('metricasVendas').style.display = 'block';

    document.getElementById('fecharMetricasVendas').style.display = 'block';

    document.getElementById('totalVendas').textContent = vendas.length;

    const valorTotal = vendas.reduce((soma, v) => soma + v.valor, 0);
    document.getElementById('valorTotal').textContent = valorTotal.toFixed(2);

    // Dados para o gráfico
    const vendasPorComprador = {};
    vendas.forEach(v => {
        if (!vendasPorComprador[v.comprador]) {
            vendasPorComprador[v.comprador] = 0;
        }
        vendasPorComprador[v.comprador] += v.valor;
    });

    const compradores = Object.keys(vendasPorComprador);
    const valores = Object.values(vendasPorComprador);


    const ctx = document.getElementById('graficoVendas').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: compradores,
            datasets: [{
                label: 'Valor de Vendas',
                data: valores,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8'
                ],
            }]
        },
        options: {
            responsive: true,
        }
    });
}

function fecharRelatorioPlantio() {
    if (graficoPlantioInstance) {
        graficoPlantioInstance.destroy();
        graficoPlantioInstance = null;
    }
    document.getElementById('metricasPlantio').style.display = 'none';
    document.getElementById('fecharMetricasPlantio').style.display = 'none';
}


function fecharRelatorioVendas() {
    document.getElementById('metricasVendas').style.display = 'none';
    document.getElementById('fecharMetricasVendas').style.display = 'none';
}

