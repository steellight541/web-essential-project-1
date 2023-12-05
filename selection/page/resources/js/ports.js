async function get_ports() {
    for (let i = 5000; i < 5010; i++) {
        try {
            let res = new  XMLHttpRequest();
            res.open('GET', `http://localhost:${i}/website/resources/data/server.json`, true);
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