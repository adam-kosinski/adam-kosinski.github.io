const MAZES = {
    "Adam's 30x30 Maze": [
        [2,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
        [0,0,0,1,0,1,1,1,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,1,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,0],
        [0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,1,0,0,0,1,1,0],
        [1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,1,1,0,1,1,0,1,0,0,0],
        [1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,1,0,1,0,1,0],
        [1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,1,0,0,1,0,0,0,1,0,0,0],
        [1,1,0,0,0,1,0,1,0,0,1,1,0,1,1,0,1,0,1,0,0,1,1,1,1,0,1,1,0,1],
        [1,0,0,1,1,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,1,1,0,1,1,0,0,1,0,0],
        [1,0,1,1,0,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,0,1,0,1,0,1,0,1],
        [1,0,0,1,0,1,1,0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,1,0,0,1,0,1,0,0],
        [1,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,0,1,1,0],
        [1,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,0,0,0,0,1,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,1,1,0,1,1,0],
        [1,1,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1,1,1,1,0],
        [1,0,1,1,0,1,1,1,0,0,1,0,1,0,1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,0],
        [1,0,0,1,0,1,0,1,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0],
        [1,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,1,1,1,0,1,1,1,0,1,0],
        [0,1,0,1,0,0,0,1,0,1,1,1,1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0],
        [0,1,0,1,1,1,0,1,0,0,0,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0],
        [0,1,0,0,1,0,0,1,1,1,1,1,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1],
        [0,1,1,0,1,0,1,0,0,0,0,1,0,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,0,0],
        [0,0,1,0,1,0,0,0,1,1,1,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1,1,0],
        [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0],
        [0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,1],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,3],
        ],
    "Adrian's 50x50 Maze":[
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,1,0,0,1,0,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0],
        [0,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],
        [0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,0],
        [0,1,1,1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1],
        [0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,1,1,0,1,0,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,1,0,1,0],
        [0,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,0,0,0,1,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,0,1,0,0,1,0,1,0,1,0,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,1,0,0,1,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,1,1,1,0,1,0,0,1,0,0,0,0,0],
        [0,1,1,1,0,1,1,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,1,0,0,1,0,1,0,0,1,0,1,0],
        [0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,1,1,0,1,0,0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,0,1,0,1],
        [1,1,0,1,0,1,0,0,1,1,1,1,0,1,1,0,1,0,1,1,1,1,0,1,0,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,0,0,1,1,1,0],
        [0,1,1,1,0,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,0],
        [0,0,0,0,1,0,1,1,1,0,0,1,0,0,0,0,1,0,1,0,1,0,0,0,0,1,0,1,0,1,1,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,1,1,0],
        [1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,0,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
        [0,0,0,0,1,0,0,0,1,0,1,0,0,1,0,0,1,0,1,0,1,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,0,0],
        [1,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,1,0,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,1,0],
        [1,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,1],
        [0,0,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,0,1,1,0,0],
        [1,0,1,0,0,1,1,1,0,1,0,0,1,0,1,0,1,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,0,1,0],
        [1,0,1,0,1,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1],
        [0,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,1,0,1,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0],
        [0,1,1,0,1,1,0,1,0,0,1,0,0,0,0,0,0,0,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0,1,0],
        [0,0,1,0,0,1,0,1,1,0,0,1,1,1,1,1,1,0,1,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,1,1,1,0],
        [0,1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,0,0,1,1,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,1,0,0],
        [0,1,0,1,1,0,1,0,1,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,1,0,0,0,0,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,1,0,1,0,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,1,0,0,1,0,0,0,1],
        [0,1,1,1,1,0,1,1,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,1,0],
        [0,1,0,1,1,1,0,1,1,0,0,1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,0,1,0,0,0],
        [0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,0],
        [0,0,1,1,0,0,0,1,0,1,0,0,1,1,1,1,1,0,1,0,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,0,1,1],
        [1,0,1,0,1,1,1,1,0,1,0,1,0,0,0,0,0,0,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,1,0,0,1],
        [1,0,1,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,1,0,1,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1],
        [0,0,0,0,1,0,1,1,1,0,1,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0],
        [0,1,1,0,1,0,1,0,0,0,0,1,0,1,1,0,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1],
        [0,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,1,1,0,0,0,1,0,0,1,1,0,0,1,1,0,1,0,0,0,1,0,1,0,1,1,1,1,1,0,0,0,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0,0,0,1,0,1,0,1,0,1,0,0,1,0,0,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,1,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1,1,0,1,1,0,1,1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
        [0,1,0,1,1,0,1,1,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0],
        [0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,1,1,1,1,0,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0],
        [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1,0,1,1,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,1,0,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,1,0,1,0],
        [0,1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,0,1,1,1,1,1,1,0,1,0,1,0,1,0,0,0,0,1,0,1,0],
        [0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,0,1,0],
        [0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,0,1,0],
        [0,1,0,0,0,1,0,0,0,1,0,0,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0,0,0,0,1,0,0,0,1,1,0,1,0,0,0,0,0,1,0,1,0,1,1,0],
        [0,1,0,1,0,1,0,1,1,1,0,1,0,0,0,0,1,1,0,1,0,0,0,0,0,1,1,1,1,0,1,1,1,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,1],
        [0,0,0,1,0,1,0,0,0,1,0,1,0,1,1,1,1,0,0,1,0,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3],
        ],
    "Anna's 40x40 Maze": [
        [2,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0],
        [0,1,1,1,1,1,0,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0],
        [0,1,0,0,0,0,1,0,1,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,1,1,0,1,1,1,0,1,1],
        [0,1,1,1,1,0,1,0,1,0,1,0,1,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,0,0,0,1,1,0,1,0,0,1,0,1,1,1,1,1,1,1,0,1],
        [0,1,1,0,0,0,0,1,0,0,1,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,1,0,0],
        [0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,1,0,1,0,1,0,0,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,0,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0],
        [1,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,1,1,0,0,0,0,0,0,0,0,1,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,1,1,0],
        [0,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,1,1,0,1,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,1,0],
        [0,1,0,0,0,1,0,0,0,1,0,0,1,1,0,1,0,1,1,1,0,0,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,1,1,1,1,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0],
        [0,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,1,1,1,0,1,0,0,1,1,0,0,1,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,3,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,1,0,1,0],
        [0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,0,1,0],
        [0,1,0,0,0,1,0,1,0,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,1,0,0,0,1,1,0,1,0,1,0],
        [0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,1,1,0,1,0,1,0,1,0],
        [0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,0,0,0,0,1,0,1,0,0,0,0,1,0,1,0,1,0],
        [0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,1,0,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1],
        [1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,0,1,0,1,0,1,1,1,0,0,0,0,0,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
        [0,1,0,1,0,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,1,0,1,0,0,0,0,0],
        [0,1,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,1,1],
        [1,1,0,1,1,1,0,0,0,1,0,1,0,1,1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,1,0,0,1,1,1,0],
        [0,0,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,1,0,0,1,1,1,1],
        [0,1,0,1,0,0,0,1,0,0,0,0,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0],
        [1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,0,0,0,1,0,1,1,0,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0],
        [0,0,0,0,0,0,1,1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0],
        [0,1,0,1,0,1,1,1,0,1,1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1,1,1,0,1,0,0,1,0,1,0,1],
        [0,1,0,1,0,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,0,0,0,0,0,1,1,0,0,0,1,1,1],
        [0,1,0,1,0,1,0,1,0,1,1,0,0,1,0,0,0,0,1,0,1,0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,1,1,0,0,0,1,1,0,0,0,0,1,0,0,0,1,0,1,0,1,0,1,0,1],
        [0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,1,0,1,0,1,0,1],
        ],
    "10x10 Test Maze": [
        [2,0,0,0,0,0,0,0,0,1],
        [0,1,0,1,0,1,0,1,0,0],
        [0,1,0,1,0,1,0,0,1,1],
        [0,1,0,1,0,0,1,0,0,0],
        [0,1,1,0,0,1,0,0,1,0],
        [0,0,0,0,1,1,0,1,0,0],
        [1,1,1,0,0,0,0,1,0,1],
        [0,0,0,0,1,1,0,1,0,0],
        [0,1,1,0,1,0,0,1,1,0],
        [0,0,0,0,1,0,1,3,0,0],
        ],
    "A Custom Maze": "A Custom Maze"
}