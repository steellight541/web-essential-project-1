async function get_ports() {
    for (let i = 5000; i < 5001; i++) {
        let url = document.location.origin.replace(/:\d+$/, '') + `:${i}/resources/data/server.json`;

        get_json(url);

    }
}

get_ports();

async function get_json(url) {
    await fetch(url)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error fetching JSON:', error))
}