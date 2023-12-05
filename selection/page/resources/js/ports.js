async function get_ports() {
    for (let i = 5000; i < 5010; i++) {
        try {
            let res = new XMLHttpRequest();
            // document.location.origin = http://localhost:5000 remove both the port and : from the string

            let url = document.location.origin.replace(/:\d+$/, '') + `:${i}/resources/data/server.json`;
            console.log(url);

            res.open('GET', url, true);
            res.send(
                res.onreadystatechange = function () {
                    if (res.readyState == 4) {
                        if (res.status == 200) {
                            console.log(`Port ${i} is open`)
                        } else {
                            console.log(`Port ${i} is closed`)
                        }
                    }
                }
            )
            if (res.ok) {
                console.log(`Port ${i} is open`)
            }

        } catch (error) {
            console.log(error);
        }

    }
}

get_ports();