function browseTo(port) {
    document.location.href = document.location.origin.slice(0, document.location.origin.length - 1) + ":" + port;
}