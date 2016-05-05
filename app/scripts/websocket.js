var data;
var connected;
var numPartitions = 0;
var partitions = [];
var system_info = document.getElementById("system-info");
var ws;
var address = "ws://localhost:3000";

function start() {
    console.log("started");
    loadCharts();
    connect();
}

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

    // Update system information
    var system_info = document.getElementById("system-info");
    system_info.platform = data.os.platform;
    system_info.os_version = data.os.version;
    system_info.home_dir = data.os.home;

    // Debug Bindings
    document.getElementById("debug_status").json = JSON.stringify(data, null, 2);

    // Memory Bindings
    google_info = document.getElementById("google-info");
    google_info.used = bytesToGB(data.memory.used);
    google_info.free = bytesToGB(data.memory.free);
    
    

    // GPU Bindings
    document.getElementById("gpuName").innerHTML = data.gpu.name;
    if(data.gpu.fanSpeed == -1) {
        document.getElementById("gpuPowerDrawDiv").style.display = "none";
    }
    if(data.gpu.powerDraw == -1) {
        document.getElementById("gpuFanSpeedDiv").style.display = "none";
    }
    document.getElementById("gpuFanSpeed").innerHTML = data.gpu.fanSpeed;
    document.getElementById("gpuPowerDraw").innerHTML = data.gpu.powerDraw;
    document.getElementById("gpuTemperature").innerHTML = data.gpu.temperature;
    document.getElementById("gpuMemoryUsed").innerHTML = MBToGB(data.gpu.used);
    document.getElementById("gpuMemoryFree").innerHTML = MBToGB(data.gpu.free);
    gpuMemoryChart.data.datasets[0].data[0] = MBToGB(data.gpu.used);
    gpuMemoryChart.data.datasets[0].data[1] = MBToGB(data.gpu.free);
    gpuMemoryChart.update();

    // Partition Bindings
    if(numPartitions != data.storage.partitions.length) {
        console.log("Num partitions changed");
        numPartitions = data.storage.partitions.length;
        partitions = [];
        document.getElementById("diskinfo").innerHTML = "";
        createPartitions();
    }
    updatePartitions();

    document.dispatchEvent(new CustomEvent("UpdateCompleteEvent",{}));
}

function createPartitions() {
    // Create empty partition elements and add them to the DOM
    for(i=0; i<numPartitions; i++) {
        // Create the card for the disk
        var container = document.createElement("paper-material");
        container.elevation = "2";

        // Create the blank element for the paritition
        var p = document.createElement("partition-element");

        // Add the card and partition information to the DOM
        document.getElementById("diskinfo").appendChild(container);
        container.appendChild(p);

        // Add the parititon to the global partitions list
        partitions.push(p);
    }
}

function updatePartitions() {
    for(i=0; i<numPartitions; i++) {
        var partitionData = data.storage.partitions[i];
        var element = partitions[i];
        element.free = bytesToGB(partitionData.free);
        element.used = bytesToGB(partitionData.used);
        element.name = partitionData.name;
    }
}

function loadCharts() {
    var ctx = document.getElementById("gpuMemoryChart");
    gpuMemoryChart = new Chart(ctx,{
        type: 'pie',
        data: {
            labels: ["Used [GB]","Available [GB]",],
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
        options: {legend: false, tooltips: false}
    });
}

function bytesToGB(bytes) {
    var gb = bytes / 1024 / 1024 / 1024;
    return Math.round((gb + 0.00001) * 100) / 100
}

function MBToGB(bytes) {
    var gb = bytes / 1024;
    return Math.round((gb + 0.00001) * 100) / 100
}

/* * * * * * * * */
/* Server Stuff */
/* * * * * * * */


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