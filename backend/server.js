const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Graph of department locations with distances (weights in meters)
const graph = {
    "Main Gate": { "Library": 100, "Admin Block": 150 },
    "Library": { "Computer Science": 200, "Admin Block": 180 },
    "Computer Science": { "Mechanical": 100, "Admin Block": 250 },
    "Mechanical": { "Cafeteria": 120 },
    "Cafeteria": { "Electronics": 200 },
    "Admin Block": { "Electronics": 220 },
};

// Function to find the shortest path using Dijkstra's Algorithm
const dijkstra = (start, target) => {
    let distances = {};
    let prev = {};
    let nodes = new Set(Object.keys(graph));

    // Initialize distances
    for (let node of nodes) {
        distances[node] = Infinity;
    }
    distances[start] = 0;

    while (nodes.size) {
        let minNode = [...nodes].reduce((a, b) => distances[a] < distances[b] ? a : b);
        nodes.delete(minNode);

        if (minNode === target) {
            let path = [];
            while (prev[target]) {
                path.push(target);
                target = prev[target];
            }
            return { path: [start, ...path.reverse()], distance: distances[minNode] };
        }

        for (let neighbor in graph[minNode]) {
            let alt = distances[minNode] + graph[minNode][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = minNode;
            }
        }
    }

    return { path: [], distance: Infinity };
};

// API Endpoint to get the shortest route
app.post("/shortest-path", (req, res) => {
    const { start, destination } = req.body;
    if (!graph[start] || !graph[destination]) {
        return res.status(400).json({ error: "Invalid locations" });
    }
    const result = dijkstra(start, destination);
    res.json(result);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
