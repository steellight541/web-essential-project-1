async function isPortActive(port, host = 'localhost') {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            // The port is active
            resolve(true);
        };

        img.onerror = () => {
            // The port is not active
            resolve(false);
        };

        img.src = `http://${"10.11.101.2"}:${port}`;
    });
}

// Example usage
const portToCheck = 5000;
isPortActive(portToCheck)
    .then((isActive) => {
        if (isActive) {
            console.log(`Port ${portToCheck} is active.`);
        } else {
            console.log(`Port ${portToCheck} is not active.`);
        }
    })
    .catch((error) => {
        console.error(`Error checking port status: ${error.message}`);
    });