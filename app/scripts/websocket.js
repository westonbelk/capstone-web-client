var data;
var connected;
var numPartitions = 0;
var partitions = [];
var system_info = document.getElementById("system-info");
var ws;
var address = "ws://localhost:3000";

function start() {
    console.log("started");
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
    memory_info = document.getElementById("memory_info");
    memory_info.label = "Memory";
    memory_info.used = bytesToGB(data.memory.used);
    memory_info.free = bytesToGB(data.memory.free);
    
    

    // GPU Bindings
    // TODO: CLEAN UP GPU BINDINGS
    document.getElementById("gpuName").innerHTML = data.gpu.name;
    if(data.gpu.fanSpeed == -1) {
        document.getElementById("gpuPowerDrawDiv").style.display = "none";
    }
    if(data.gpu.powerDraw == -1) {
        document.getElementById("gpuFanSpeedDiv").style.display = "none";
    }
    document.getElementById("gpuFanSpeed").innerHTML = data.gpu.fanSpeed;
    document.getElementById("gpuPowerDraw").innerHTML = data.gpu.powerDraw;

    gpu_memory_info = document.getElementById("gpu_memory_info");
    gpu_memory_info.label = "Memory";
    gpu_memory_info.used = MBToGB(data.gpu.used);
    gpu_memory_info.free = MBToGB(data.gpu.free);

    // Partition Bindings
    if(numPartitions != data.storage.partitions.length) {
        console.log("Num partitions changed");
        numPartitions = data.storage.partitions.length;
        partitions = [];
        document.getElementById("diskinfo").innerHTML = "";
        createPartitions();
    }
    updatePartitions();
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

function bytesToGB(bytes) {
    var gb = bytes / 1024 / 1024 / 1024;
    return gb.toFixed(2);
}

function MBToGB(bytes) {
    var gb = bytes / 1024;
    return gb.toFixed(2);
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