var data;
var connected;

/* * /
 Update Client
 */
function updateClient() {
    // OS Monitor Bindings
    /*if(data.hasOwnProperty('os')) {
        console.log("has os");
    }*/
    document.getElementById("user").innerHTML = data.os.user;
    document.getElementById("hostname").innerHTML = data.os.hostname;
    document.getElementById("platform").innerHTML = data.os.platform;
    document.getElementById("osVersion").innerHTML = data.os.version;
    document.getElementById("homeDir").innerHTML = data.os.home;

    // Debug Bindings
    document.getElementById("jsonDebug").innerHTML = JSON.stringify(data, null, 2);

    // Memory Bindings
    memoryChart.data.datasets[0].data[0] = data.memory.used;
    memoryChart.data.datasets[0].data[1] = data.memory.free;
    memoryChart.update();
}

function loadCharts() {
    var ctx = document.getElementById("memoryChart");
    memoryChart = new Chart(ctx,{
        type: 'pie',
        data: {
            labels: ["Used","Available",],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB"
                    ],
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB"
                    ]
                }]},
        options: {}
    });
}


/* * * * * * * * */
/* Server Stuff */
/* * * * * * * */
var ws;
var address = "ws://localhost:3000";
function start() {
    console.log("started");
    loadCharts();
    connect();
}


function connect() {
    if(!ws || ws.readyState !== WebSocket.OPEN) {
        ws = new WebSocket(address);
        ws.onerror = function (e) {
            console.log("Error ignored");
            ws.close();
        };
        ws.onopen = function () {
            setConnectedStatus(true);
            ws.send("init");
        };
        ws.onmessage = function (evt) {
            console.log("Message received");
            data = JSON.parse(evt.data);
            updateClient();
        };
        ws.onclose = function () {
            setConnectedStatus(false);
        };
    }
}

function disconnect() {
    ws.close();
    setConnectedStatus(false);
}

function setConnectedStatus(isConnected) {
    if(isConnected) {
        connected = true;
        document.getElementById('status').style.backgroundColor = "green";
    }
    else {
        connected = false;
        document.getElementById('status').style.backgroundColor = "red";

    }
}

function connectToNew(newAddress) {
    disconnect();
    address = newAddress;
    connect();
}

window.onbeforeunload = function() {
    disconnect();
};

setInterval(
    function() {
        if(connected){
            ws.send("");
        }
        else {

        }
    }
    ,1000
);