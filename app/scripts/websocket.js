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
    var user_info = document.getElementById("user_info")
    user_info.user = data.os.user;
    user_info.hostname = data.os.hostname;

    // Update system information
    var system_info = document.getElementById("system_info");
    system_info.platform = data.os.platform;
    system_info.os_version = data.os.version;
    system_info.home_dir = data.os.home;

    // Debug Bindings
    document.getElementById("debug_status").json = JSON.stringify(data, null, 2);

    // CPU Bindings
    // Clean up CPU name for intel processors (have not tested amd yet)
    var cpu_name = data.cpu.name;
    if(data.cpu.vendor == "GenuineIntel") {
        var cpu_name = data.cpu.name.split("@")[0].replace("CPU","").replace("(TM)", "").replace("(R)","").trim();
    }
    document.getElementById("cpu_name").innerHTML = cpu_name;
    var cpu_info = document.getElementById("cpu_info");
    cpu_info.uptime = data.cpu.uptime;
    cpu_info.clock_speed = data.cpu.freq;
    cpu_info.temperature = data.cpu.temperature;
    cpu_info.voltage = data.cpu.voltage;
    cpu_info.fan_usage = data.cpu.fanSpeed;


    // Memory Bindings
    var memory_info = document.getElementById("memory_info");
    memory_info.label = "Memory";
    memory_info.used = bytesToGB(data.memory.used);
    memory_info.free = bytesToGB(data.memory.free);
    
    
    // GPU Bindings
    // If there is no gpu in the system then hide the gpu card
    if (data.hasOwnProperty('gpu')) {
        document.getElementById('gpu').style.display = "";

        document.getElementById("gpu_name").innerHTML = data.gpu.name;
        var gpu_info = document.getElementById("gpu_info");
        gpu_info.temperature = data.gpu.temperature;
        gpu_info.power_draw = data.gpu.powerDraw;
        gpu_info.fan_usage = data.gpu.fanSpeed;

        var gpu_memory_info = document.getElementById("gpu_memory_info");
        gpu_memory_info.label = "Memory";
        gpu_memory_info.used = MBToGB(data.gpu.used);
        gpu_memory_info.free = MBToGB(data.gpu.free);
    }
    else {
        document.getElementById('gpu').style.display = "none";
    }

    

    // Partition Bindings
    if(numPartitions != data.storage.partitions.length) {
        console.log("Num partitions changed");
        numPartitions = data.storage.partitions.length;
        partitions = [];
        document.getElementById("disk_info").innerHTML = "";
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
        document.getElementById("disk_info").appendChild(container);
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